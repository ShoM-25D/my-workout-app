from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")
# データベースへの接続の起点を作成
engine = create_engine(DATABASE_URL)
# Baseを継承したクラスがDBのテーブルとして扱えるようにする
Base = declarative_base()

class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, autoincrement=True)
  name = Column(String, nullable=False)
  email = Column(String, unique=True, nullable=False)
  password_hash = Column(String, nullable=False)
  is_admin = Column(Boolean, default=False)
  # 自動的に時間を記録
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  workouts = relationship("Workout", back_populates="user")

class Exercise(Base):
  __tablename__ = "exercises"
  id = Column(Integer, primary_key=True, autoincrement=True)
  name = Column(String, nullable=False)
  target_muscle = Column(String)
  description = Column(String)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Workout(Base):
  __tablename__ = "workouts"
  id = Column(Integer, primary_key=True, autoincrement=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  date = Column(String, nullable=False)
  duration = Column(Integer)
  notes = Column(String)
  body_weight = Column(Float)
  body_fat = Column(Float)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  user = relationship("User", back_populates="workouts")
  workout_exercises = relationship("WorkoutExercise", back_populates="workout")

class WorkoutExercise(Base):
  __tablename__ = "workout_exercises"
  id = Column(Integer, primary_key=True, autoincrement=True)
  workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
  exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
  order = Column(Integer)  # 種目の順番
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  workout = relationship("Workout", back_populates="workout_exercises")
  exercise = relationship("Exercise")
  sets = relationship("Set", back_populates="workout_exercise")

class Set(Base):
  __tablename__ = "sets"
  id = Column(Integer, primary_key=True, autoincrement=True)
  workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
  set_number = Column(Integer, nullable=False)
  weight = Column(Float)
  reps = Column(Integer)
  is_superset = Column(Boolean, default=False)
  superset_exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=True)
  superset_weight = Column(Float, nullable=True)
  superset_reps = Column(Integer, nullable=True)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  workout_exercise = relationship("WorkoutExercise", back_populates="sets")

# テーブルを作成
Base.metadata.create_all(engine)

# DBとのセッションを管理
SessionLocal = sessionmaker(bind=engine)