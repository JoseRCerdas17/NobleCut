from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "evolution-x-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def verificar_password(password_plano, password_hash):
    return bcrypt.checkpw(password_plano.encode("utf-8"), password_hash.encode("utf-8"))

def hashear_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def crear_token(data: dict):
    datos = data.copy()
    expira = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    datos.update({"exp": expira})
    return jwt.encode(datos, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            return None
        return payload
    except JWTError:
        return None