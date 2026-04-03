from fastapi import FastAPI, Depends, HTTPException, Header
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal, User, Exercise, Workout, WorkoutExercise, Set
from auth import hash_password, verify_password, create_access_token, decode_access_token
from datetime import datetime, timezone, timedelta

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)
class SetInput(BaseModel):
  weight: float
  reps: int

class ExerciseInput(BaseModel):
  name: str
  body_part: str
  sets: list[SetInput]

# リクエストの形を定義
class ExerciseCreate(BaseModel):
  name: str
  target_muscle: str
  description: str
class WorkoutCreate(BaseModel):
  date:str
  duration:int
  notes:str | None = None
  body_weight: float | None = None
  body_fat: float | None = None
  exercises: list[ExerciseInput] = []

class WorkoutExerciseCreate(BaseModel):
  exercise_id: int
  order: int

class UserRegister(BaseModel):
  name: str
  email: str
  password: str

class UserLogin(BaseModel):
  email: str
  password: str

class SetCreate(BaseModel):
  set_number:int
  weight: float
  reps: int
  is_superset: bool = False
  superset_exercise_id: int | None = None
  superset_weight: float | None = None
  superset_reps: int | None = None


# DBセッションを取得する関数
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="認証トークンがありません")

  token = authorization.split(" ")[1]
  payload = decode_access_token(token)

  if not payload:
    raise HTTPException(status_code=401, detail="無効または期限切れのトークンです")

  user_id = int(payload.get("sub"))
  user = db.query(User).filter(User.id == user_id).first()

  if not user:
    raise HTTPException(status_code=401, detail="ユーザが見つかりません")

  return user

# ユーザ登録
@app.post("/auth/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
  # メールアドレスの重複チェック
  existing_user = db.query(User).filter(User.email == user.email).first()

  if existing_user:
    raise HTTPException(status_code=400, detail="このメールアドレスは既に登録されています")

  new_user = User(
    name=user.name,
    email=user.email,
    password_hash=hash_password(user.password),
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return {"message": "ユーザ登録が完了しました"}

# ログイン
@app.post("/auth/login")
def login(user: UserLogin, db:Session = Depends(get_db)):
  db_user = db.query(User).filter(User.email == user.email).first()

  if not db_user or not verify_password(user.password, db_user.password_hash):
    raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

  token = create_access_token({"sub": str(db_user.id), "name" : db_user.name})
  return {"access_token": token, "token_type": "bearer", "name": db_user.name, "email": db_user.email}

@app.get("/workouts")
def get_workouts(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  workouts = db.query(Workout).options(
    joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets),
    joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise)
  ).filter(Workout.user_id == current_user.id).order_by(Workout.date.desc()).all()

  result = []
  for workout in workouts:
    exercises = []
    for we in workout.workout_exercises:
      exercises.append({
        "id": str(we.id),
        "name": we.exercise.name,
        "bodyPart": we.exercise.target_muscle,
        "sets":[{"weight": s.weight, "reps": s.reps} for s in we.sets],
      })
    result.append({
      "id":str(workout.id),
      "date":workout.date,
      "duration":workout.duration,
      "notes":workout.notes,
      "bodyWeight":workout.body_weight,
      "bodyFat":workout.body_fat,
      "exercises":exercises,
    })

  return result

@app.post("/workouts")
def create_workout(workout: WorkoutCreate, current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  new_workout = Workout(
    user_id=current_user.id,
    date=workout.date,
    duration=workout.duration,
    notes=workout.notes,
    body_weight=workout.body_weight,
    body_fat=workout.body_fat,
  )
  db.add(new_workout)
  db.flush()

  exercises_out = []
  for order, exercise_input in enumerate(workout.exercises):
    exercise = db.query(Exercise).filter(Exercise.name == exercise_input.name).first()

    if not exercise:
      exercise = Exercise(
        name = exercise_input.name,
        target_muscle = exercise_input.body_part,
        description=""
      )
      db.add(exercise)
      db.flush()

    workout_exercise = WorkoutExercise(
      workout_id=new_workout.id,
      exercise_id=exercise.id,
      order=order,
    )

    db.add(workout_exercise)
    db.flush()

    for set_number, set_input in enumerate(exercise_input.sets, 1):
      new_set = Set(
        workout_exercise_id = workout_exercise.id,
        set_number=set_number,
        weight=set_input.weight,
        reps=set_input.reps,
      )
      db.add(new_set)

    exercises_out.append({
      "id" : str(workout_exercise.id),
      "name":exercise.name,
      "bodyPart":exercise_input.body_part,
      "sets": [{"weight": s.weight, "reps": s.reps} for s in exercise_input.sets],
    })

  db.commit()
  return {
    "id": str(new_workout.id),
    "date": new_workout.date,
    "duration": new_workout.duration,
    "notes": new_workout.notes,
    "bodyWeight":new_workout.body_weight,
    "bodyFat": new_workout.body_fat,
    "exercises": exercises_out,}

@app.get("/workouts/{workout_id}")
def get_workout(workout_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  workout = db.query(Workout).options(
    joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets),
    joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise)
  ).filter(Workout.id == workout_id, Workout.user_id == current_user.id).first()

  if not workout:
    raise HTTPException(status_code=404, detail="ワークアウトが見つかりません")

  exercises = []
  for we in workout.workout_exercises:
    exercises.append({
      "id": str(we.id),
      "name": we.exercise.name,
      "bodyPart":we.exercise.target_muscle,
      "sets":[{"weight": s.weight, "reps": s.reps} for s in we.sets],
    })

  return {
    "id": str(workout.id),
    "date":workout.date,
    "duration": workout.duration,
    "notes": workout.notes,
    "bodyWeight": workout.body_weight,
    "bodyFat": workout.body_fat,
    "exercises": exercises,
  }

@app.get("/exercises")
def get_exercises(db: Session = Depends(get_db)):
  return db.query(Exercise).all()

@app.post("/exercises")
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
  new_exercise = Exercise(
    name=exercise.name,
    target_muscle=exercise.target_muscle,
    description=exercise.description,
  )
  db.add(new_exercise)
  db.commit()
  db.refresh(new_exercise)
  return new_exercise

@app.post("/workouts/{workout_id}/exercises")
def add_exercise_to_workout(workout_id: int, workout_exercise: WorkoutExerciseCreate, db: Session = Depends(get_db)):
  workout = db.query(Workout).filter(Workout.id == workout_id).first()

  if not workout:
    raise HTTPException(status_code=404, detail="ワークアウトが見つかりません")

  exercise = db.query(Exercise).filter(Exercise.id == workout_exercise.exercise_id).first()

  if not exercise:
    raise HTTPException(status_code=404, detail="種目が見つかりません")

  new_workout_exercise = WorkoutExercise(
    workout_id=workout_id,
    exercise_id=workout_exercise.exercise_id,
    order=workout_exercise.order,
  )
  db.add(new_workout_exercise)
  db.commit()
  db.refresh(new_workout_exercise)
  return new_workout_exercise

@app.post("/workout_exercise/{workout_exercise_id}/sets")
def add_set_to_workout_exercise(workout_exercise_id: int, set_data: SetCreate, db: Session = Depends(get_db)):
  workout_exercise = db.query(WorkoutExercise).filter(WorkoutExercise.id == workout_exercise_id).first()

  if not workout_exercise:
    raise HTTPException(status_code=404, detail="ワークアウト種目が見つかりません")

  new_set = Set(
    workout_exercise_id=workout_exercise_id,
    set_number=set_data.set_number,
    weight=set_data.weight,
    reps=set_data.reps,
    is_superset= set_data.is_superset,
    superset_exercise_id=set_data.superset_exercise_id,
    superset_weight=set_data.superset_weight,
    superset_reps=set_data.superset_reps,
  )
  db.add(new_set)
  db.commit()
  db.refresh(new_set)
  return new_set

@app.get("/stats/personal_records")
def get_personal_records(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  records = db.query(
    Exercise.name,
    func.max(Set.weight).label("max_weight"),
    ).join(WorkoutExercise, WorkoutExercise.exercise_id == Exercise.id
    ).join(Set, Set.workout_exercise_id== WorkoutExercise.id
    ).filter(Workout.user_id == current_user.id
    ).group_by(Exercise.name
    ).order_by(func.max(Set.weight
    ).desc()).all()

  return [{"exercise_name": r.name, "max_weight" :r.max_weight} for r in records]

@app.get("/stats/progress/{exercise_id}")
def get_progress(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  progress= db.query(
    Workout.date,
    func.max(Set.weight).label("max_weight"),
  ).join(WorkoutExercise, WorkoutExercise.workout_id == Workout.id
  ).join(Set, Set.workout_exercise_id == WorkoutExercise.id
  ).join(Workout, Workout.id == WorkoutExercise.workout_id
  ).filter(WorkoutExercise.exercise_id == exercise_id
  ).filter(Workout.user_id == current_user.id
  ).group_by(Workout.date
  ).order_by(Workout.date).all()

  return [{"date": p.date, "max_weight": p.max_weight} for p in progress]

@app.get("/stats/frequency")
def get_frequency(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  today = datetime.now(timezone.utc)
  this_month_start = today.replace(day=1).strftime("%Y-%m-%d")
  this_week_start = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
  total = db.query(func.count(Workout.id)).filter(Workout.user_id == current_user.id).scalar()

  this_month = db.query(func.count(Workout.id)).filter(
    Workout.user_id == current_user.id,
    Workout.date >= this_month_start,
  ).scalar()

  this_week = db.query(func.count(Workout.id)).filter(
    Workout.user_id == current_user.id,
    Workout.date >= this_week_start
  ).scalar()

  first_date = db.query(func.min(Workout.date)).filter(Workout.user_id == current_user.id).scalar()

  if first_date and total > 0:
    weeks = max((today.date() - datetime.strptime(first_date, "%Y-%m-%d").date()).days / 7, 1)
    average_per_week = round(total / weeks, 1)
  else:
    average_per_week = 0

  return [{"total": total, "this_month": this_month, "this_week": this_week, "average_per_week": average_per_week}]
