from fastapi import FastAPI, Depends, HTTPException, Header
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal, User, Exercise, Workout, WorkoutExercise, Set
from auth import hash_password, verify_password, create_access_token, decode_access_token
from datetime import datetime, timezone, timedelta

# サーバー立ち上げ
app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
# データモデルの定義
class SetInput(BaseModel):
  weight: float
  reps: int
  set_type: str = "normal"
  superset_exercise_id: int | None = None
  superset_weight: float | None = None
  superset_reps: int | None = None

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
  set_type: str="normal"
  superset_exercise_id: int | None = None
  superset_weight: float | None = None
  superset_reps: int | None = None

class AddExercisesToWorkout(BaseModel):
  exercises: list[ExerciseInput]

# DBセッションを取得する関数
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

# トークン切れによるリダイレクト処理
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
  # ヘッダーの存在チェック
  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="認証トークンがありません")

  token = authorization.split(" ")[1]
  # JWTトークンの辞書化
  payload = decode_access_token(token)

  # payloadの検証
  if not payload:
    raise HTTPException(status_code=401, detail="無効または期限切れのトークンです")

  # sub: ユーザIDなど, exp: 有効期限, iat: 発行時刻
  user_id = int(payload.get("sub"))
  user = db.query(User).filter(User.id == user_id).first()

  # 最終確認と返却
  if not user:
    raise HTTPException(status_code=401, detail="ユーザが見つかりません")

  return user

# 管理者チェック
def get_admin_user(current_user:User = Depends(get_current_user)) -> User:
  # 権限の判定
  if not current_user.is_admin:
    raise HTTPException(status_code=403, detail="管理者権限が必要です")
  return current_user

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

  # パスワードと存在チェック
  if not db_user or not verify_password(user.password, db_user.password_hash):
    raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが正しくありません")

  # JWTを作成
  token = create_access_token({"sub": str(db_user.id), "name" : db_user.name})
  return {
    "access_token": token,
    "token_type": "bearer",
    "id":db_user.id,
    "name": db_user.name,
    "email": db_user.email,
    "is_admin":db_user.is_admin or False
  }

# Workoutsをすべて取得
@app.get("/workouts")
def get_workouts(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  # データの取得
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
        "sets":[
          {
            "weight": s.weight,
            "reps": s.reps,
            "setType":s.set_type,
            "supersetExerciseId": s.superset_exercise_id,
            "supersetWeight": s.superset_weight,
            "supersetReps": s.superset_reps,
          } for s in we.sets],
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

# 本日のトレーニング内容を保存
@app.post("/workouts")
def create_workout(workout: WorkoutCreate, current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  # 親データ(Workout)作成
  new_workout = Workout(
    user_id=current_user.id,
    date=workout.date,
    duration=workout.duration,
    notes=workout.notes,
    body_weight=workout.body_weight,
    body_fat=workout.body_fat,
  )
  db.add(new_workout)
  # 一時保存
  db.flush()

  exercises_out = []
  # 中間データ(WorkoutExercise)作成
  for order, exercise_input in enumerate(workout.exercises):
    exercise = db.query(Exercise).filter(Exercise.name == exercise_input.name).first()

    if not exercise:
      raise HTTPException(status_code=404, detail=f"種目 '{exercise_input.name}' が見つかりません")

    workout_exercise = WorkoutExercise(
      workout_id=new_workout.id,
      exercise_id=exercise.id,
      order=order,
    )

    db.add(workout_exercise)
    db.flush()

    # 子データ(Set)作成
    for set_number, set_input in enumerate(exercise_input.sets, 1):
      new_set = Set(
        workout_exercise_id = workout_exercise.id,
        set_number=set_number,
        weight=set_input.weight,
        reps=set_input.reps,
        set_type=set_input.set_type,
        superset_exercise_id=set_input.superset_exercise_id,
        superset_weight=set_input.superset_weight,
        superset_reps=set_input.superset_reps
      )
      db.add(new_set)

    exercises_out.append({
      "id" : str(workout_exercise.id),
      "name":exercise.name,
      "bodyPart":exercise_input.body_part,
      "sets": [{
            "weight": s.weight,
            "reps": s.reps,
            "setType":s.set_type,
            "supersetWeight": s.superset_weight,
            "supersetReps": s.superset_reps
          } for s in exercise_input.sets],
    })

  # 完全保存
  db.commit()
  return {
    "id": str(new_workout.id),
    "date": new_workout.date,
    "duration": new_workout.duration,
    "notes": new_workout.notes,
    "bodyWeight":new_workout.body_weight,
    "bodyFat": new_workout.body_fat,
    "exercises": exercises_out,}

# 日付に対応する記録を取得
@app.get("/workouts/by-date/{date}")
def get_workout_by_date(date:str, current_user:User = Depends(get_current_user), db: Session = Depends(get_db)):
  workout = db.query(Workout).filter(
    Workout.date == date,
    Workout.user_id == current_user.id
  ).first()

  if not workout:
    raise HTTPException(status_code=404, detail=f"{date}の記録が見つかりませんでした")

  return {"id": str(workout.id), "date": workout.date}

# 日付に対応する記録を削除
@app.delete("/workouts/by-date/{date}")
def delete_workout_by_date(date: str, current_user:User = Depends(get_current_user), db:Session = Depends(get_db)):
  workouts = db.query(Workout).filter(
    Workout.date == date,
    Workout.user_id == current_user.id
  ).all()

  if not workouts:
    raise HTTPException(status_code=404, detail=f"{date}の記録が見つかりませんでした")

  workout_ids = [w.id for w in workouts]
  try:
    db.query(Set).filter(Set.workout_exercise_id.in_(
      db.query(WorkoutExercise.id).filter(WorkoutExercise.workout_id.in_(workout_ids))
    )).delete(synchronize_session=False)
    db.query(WorkoutExercise).filter(WorkoutExercise.workout_id.in_(workout_ids)).delete(synchronize_session=False)
    db.query(Workout).filter(Workout.id.in_(workout_ids)).delete(synchronize_session=False)
    db.commit()

  except Exception as e:
    db.rollback()
    print(f"Delete Error: {e}")
    raise HTTPException(status_code=500, detail="削除中にエラーが発生しました")

  return {"message": f"{date}の記録（{len(workouts)}件）をすべて削除しました。"}

# 記録を取得
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
      "sets":[{
            "weight": s.weight,
            "reps": s.reps,
            "setType":s.set_type,
            "supersetExerciseId":s.superset_exercise_id,
            "supersetWeight": s.superset_weight,
            "supersetReps": s.superset_reps,
          } for s in we.sets],
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

# 記録を削除
@app.delete("/workouts/{workout_id}")
def delete_workout_by_id(workout_id: int, current_user:User = Depends(get_current_user), db:Session = Depends(get_db)):
  workout = db.query(Workout).filter(
    Workout.id == workout_id,
    Workout.user_id == current_user.id
  ).first()

  if not workout:
    raise HTTPException(status_code=404, detail="記録が見つかりませんでした")

  try:
    db.query(Set).filter(Set.workout_exercise_id.in_(
      db.query(WorkoutExercise.id).filter(WorkoutExercise.workout_id==workout_id)
    )).delete(synchronize_session=False)
    db.query(WorkoutExercise).filter(WorkoutExercise.workout_id==workout_id).delete(synchronize_session=False)
    db.delete(workout)
    db.commit()

  except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail="削除中にエラーが発生しました")

  return {"message": f"記録を削除しました。"}

# 記録に追加
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

# 既存の記録に種目を追加
@app.post("/workouts/{workout_id}/add-exercises")
def add_exercises_to_workout(
  workout_id: int,
  data: AddExercisesToWorkout,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  workout = db.query(Workout).filter(
    Workout.id == workout_id,
    Workout.user_id == current_user.id
  ).first()

  if not workout:
    raise HTTPException(status_code=404, detail="ワークアウトが見つかりません")

  # 追加する種目を既存の種目の最後に追加するための項番を取得(DBから直接取得するため早い)
  max_order = db.query(func.max(WorkoutExercise.order)).filter(
    WorkoutExercise.workout_id == workout_id
  ).scalar() or 0

  for order, exercise_input in enumerate(data.exercises, max_order + 1):
    exercise = db.query(Exercise).filter(Exercise.name == exercise_input.name).first()

    if not exercise:
      raise HTTPException(status_code=404, detail=f"種目 '{exercise_input.name}' が見つかりません")

    workout_exercise = WorkoutExercise(
      workout_id=workout_id,
      exercise_id=exercise.id,
      order=order,
    )

    db.add(workout_exercise)
    db.flush()

    for set_number, set_input in enumerate(exercise_input.sets, 1):
      new_set = Set(
        workout_exercise_id=workout_exercise.id,
        set_number=set_number,
        weight=set_input.weight,
        reps=set_input.reps,
        set_type=set_input.set_type,
        superset_exercise_id=set_input.superset_exercise_id,
        superset_weight=set_input.superset_weight,
        superset_reps=set_input.superset_reps,
      )
      db.add(new_set)

  db.commit()
  return {"message": "種目を追加しました"}

# 種目を削除(管理者のみ)
@app.delete("/exercises/{exercise_id}")
def delete_exercise_by_id(exercise_id:int, admin_user: User = Depends(get_admin_user),  db: Session = Depends(get_db)):
  exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()

  if not exercise:
    raise HTTPException(status_code=404, detail="種目が見つかりません")

  used = db.query(WorkoutExercise).filter(WorkoutExercise.exercise_id == exercise_id).first()

  if used:
    raise HTTPException(status_code=400, detail="この種目はワークアウト記録で使用中のため削除できません")

  try:
    db.delete(exercise)
    db.commit()

  except Exception as e:
    db.rollback()
    print(f"Delete Error: {e}")
    raise HTTPException(status_code=500, detail=f"削除に失敗しました: {str(e)}")

  return{"message": "削除が完了しました"}

# 記録の種目を削除
@app.delete("/workout_exercise/{workout_exercise_id}")
def delete_exercise_id(
  workout_exercise_id: int,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  workout_exercise = db.query(WorkoutExercise).join(Workout).filter(
    WorkoutExercise.id == workout_exercise_id,
    Workout.user_id == current_user.id
  ).first()

  if not workout_exercise:
    raise HTTPException(status_code=404, detail="種目が見つかりません")

  try:
    db.query(Set).filter(Set.workout_exercise_id == workout_exercise_id).delete(synchronize_session=False)
    db.delete(workout_exercise)
    db.commit()

  except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail="削除に失敗しました")

  return {"message": "削除が完了しました"}

# 種目一覧を取得
@app.get("/exercises")
def get_exercises(db: Session = Depends(get_db)):
  return db.query(Exercise).all()

# 種目を新規作成(管理者のみ)
@app.post("/exercises")
def create_exercise(exercise: ExerciseCreate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
  existing_exercise = db.query(Exercise).filter(Exercise.name == exercise.name).first()

  if existing_exercise:
    raise HTTPException(status_code=400, detail="この種目は既に登録されています")

  new_exercise = Exercise(
    name=exercise.name,
    target_muscle=exercise.target_muscle,
    description=exercise.description,
  )
  db.add(new_exercise)
  db.commit()
  db.refresh(new_exercise)
  return new_exercise

# 種目名を更新(管理者のみ)
@app.put("/exercises/{exercise_id}")
def update_exercise(exercise_id: int, exercise_data: ExerciseCreate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(
    Exercise.id == exercise_id,
  ).first()

    if not exercise:
      raise HTTPException(status_code=404, detail="種目が見つかりません")

    exercise.name = exercise_data.name
    exercise.target_muscle = exercise_data.target_muscle
    exercise.description = exercise_data.description
    db.commit()

    return {"message": "更新が完了しました"}

# 記録の種目にセットを追加
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
    set_type=set_data.set_type,
    superset_exercise_id=set_data.superset_exercise_id,
    superset_weight=set_data.superset_weight,
    superset_reps=set_data.superset_reps,
  )
  db.add(new_set)
  db.commit()
  db.refresh(new_set)
  return new_set

# 個人のMAX重量を取得
@app.get("/stats/personal_records")
def get_personal_records(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
  records = db.query(
    Exercise.name,
    func.max(Set.weight).label("max_weight"),
    ).join(WorkoutExercise, WorkoutExercise.exercise_id == Exercise.id
    ).join(Set, Set.workout_exercise_id== WorkoutExercise.id
    ).join(Workout, Workout.id == WorkoutExercise.workout_id
    ).filter(Workout.user_id == current_user.id
    ).group_by(Exercise.name
    ).order_by(func.max(Set.weight
    ).desc()).all()

  return [{"exercise_name": r.name, "max_weight" :r.max_weight} for r in records]

# 種目ごとの進捗を取得
@app.get("/stats/progress/{exercise_id}")
def get_progress(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  progress= db.query(
    Workout.date,
    func.max(Set.weight).label("max_weight"),
  ).join(WorkoutExercise, WorkoutExercise.workout_id == Workout.id
  ).join(Set, Set.workout_exercise_id == WorkoutExercise.id
  ).filter(WorkoutExercise.exercise_id == exercise_id
  ).filter(Workout.user_id == current_user.id
  ).group_by(Workout.date
  ).order_by(Workout.date).all()

  return [{"date": p.date, "max_weight": p.max_weight} for p in progress]

# 頻度を取得
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
