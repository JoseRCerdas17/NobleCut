from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from database.connection import Base
from datetime import datetime


class Resena(Base):
    __tablename__ = "resenas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(Text, nullable=False)
    aprobado = Column(Boolean, default=True)
    creado_en = Column(DateTime, default=datetime.utcnow)