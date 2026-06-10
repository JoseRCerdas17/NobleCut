from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth.security import verificar_password, crear_token, verificar_token, hashear_password
from pydantic import BaseModel
from database.connection import SessionLocal
from models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str
    rol: str
    barbero: str | None


class UsuarioInfo(BaseModel):
    username: str
    rol: str
    barbero: str | None


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.username == form_data.username).first()
        if not usuario:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        if not verificar_password(form_data.password, usuario.password_hash):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        token = crear_token({
            "sub": usuario.username,
            "rol": usuario.rol,
            "barbero": usuario.barbero or "",
        })
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()


@router.get("/verificar", response_model=TokenData)
def verificar(token: str = Depends(oauth2_scheme)):
    payload = verificar_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalido")
    return TokenData(
        username=payload.get("sub", ""),
        rol=payload.get("rol", "barber"),
        barbero=payload.get("barbero") or None,
    )


@router.get("/usuarios", response_model=list[UsuarioInfo])
def listar_usuarios(token: str = Depends(oauth2_scheme)):
    payload = verificar_token(token)
    if not payload or payload.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Solo el administrador puede ver los usuarios")
    db = SessionLocal()
    try:
        usuarios = db.query(Usuario).all()
        return [
            UsuarioInfo(username=u.username, rol=u.rol, barbero=u.barbero)
            for u in usuarios
        ]
    finally:
        db.close()


def get_usuario_actual(token: str = Depends(oauth2_scheme)) -> TokenData:
    payload = verificar_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="No autorizado")
    return TokenData(
        username=payload.get("sub", ""),
        rol=payload.get("rol", "barber"),
        barbero=payload.get("barbero") or None,
    )


def get_admin_actual(token: str = Depends(oauth2_scheme)) -> str:
    payload = verificar_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="No autorizado")
    return payload.get("sub", "")