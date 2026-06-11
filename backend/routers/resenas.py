from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database.connection import get_db
from models.resena import Resena
from auth.security import verificar_token

router = APIRouter(prefix="/resenas", tags=["reseñas"])
security = HTTPBearer()


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verificar_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="No autorizado")
    if payload.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return payload


class ResenaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    calificacion: int = Field(..., ge=1, le=5)
    comentario: str = Field(..., min_length=1, max_length=500)


class ResenaResponse(BaseModel):
    id: int
    nombre: str
    calificacion: int
    comentario: str
    creado_en: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=ResenaResponse)
def crear_resena(data: ResenaCreate, db: Session = Depends(get_db)):
    resena = Resena(
        nombre=data.nombre.strip(),
        calificacion=data.calificacion,
        comentario=data.comentario.strip(),
        aprobado=True,
    )
    db.add(resena)
    db.commit()
    db.refresh(resena)
    return resena


@router.get("/", response_model=list[ResenaResponse])
def listar_resenas(db: Session = Depends(get_db)):
    resenas = (
        db.query(Resena)
        .filter(Resena.aprobado == True)
        .order_by(Resena.creado_en.desc())
        .limit(5)
        .all()
    )
    return resenas


@router.get("/todas", response_model=list[ResenaResponse])
def listar_todas_resenas(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    verificar_token(credentials.credentials)
    return (
        db.query(Resena)
        .order_by(Resena.creado_en.desc())
        .all()
    )


@router.delete("/{resena_id}")
def eliminar_resena(
    resena_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    get_current_admin(credentials)
    resena = db.query(Resena).filter(Resena.id == resena_id).first()
    if not resena:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    db.delete(resena)
    db.commit()
    return {"message": "Reseña eliminada"}