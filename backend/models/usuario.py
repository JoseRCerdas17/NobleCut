from sqlalchemy import Column, Integer, String, DateTime
from database.connection import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="barber")
    barbero = Column(String, nullable=True)
    creado_en = Column(DateTime, default=datetime.utcnow)