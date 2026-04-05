from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent / ".env")
# パスワードのハッシュ化設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWTの設定
SECRET_KEY = os.getenv("SECRET_KEY") # 後で環境変数に移動する
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data:dict) -> str:
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token:str) -> dict:
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
  except JWTError:
    return None
