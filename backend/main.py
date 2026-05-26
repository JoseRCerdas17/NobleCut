import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine, ensure_reserva_reminder_columns, ensure_cancelada_en_column, SessionLocal
from models.reserva import Reserva
from recordatorios import iniciar_scheduler, shutdown_scheduler
from recordatorios_logic import CR_TZ, MIN_SEGUNDOS_ANTES_UNA_HORA, MAX_SEGUNDOS_ANTES_UNA_HORA, parse_cita_cr, debe_enviar_dia_previo, debe_enviar_1h
from routers import auth, reservas

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)
logging.getLogger("recordatorios").setLevel(logging.INFO)

_ENV_REMINDER_OFF = frozenset({"1", "true", "yes", "on"})

Base.metadata.create_all(bind=engine)
ensure_reserva_reminder_columns()
ensure_cancelada_en_column()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = iniciar_scheduler()
    app.state.reminder_scheduler = scheduler
    try:
        yield
    finally:
        shutdown_scheduler(scheduler)


app = FastAPI(
    title="Visionary Studio API",
    description="API para Visionary Studio Barber Shop",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservas.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Visionary Studio API funcionando"}


@app.get("/health/reminders")
def health_reminders(request: Request):
    """Diagnóstico ligero (sin secretos) para comprobar si el scheduler y Resend están activos."""
    disable = os.getenv("DISABLE_REMINDER_SCHEDULER", "").strip().lower() in _ENV_REMINDER_OFF
    sched = getattr(request.app.state, "reminder_scheduler", None)
    payload = {
        "reminders_disabled_by_env": disable,
        "resend_api_key_configured": bool(os.getenv("RESEND_API_KEY")),
        "scheduler_started": sched is not None,
    }
    if sched:
        job = sched.get_job("recordatorios_visionary")
        if job and job.next_run_time:
            payload["scheduler_next_run_iso"] = job.next_run_time.isoformat()
    return payload


@app.get("/health/reminders/debug")
def health_reminders_debug():
    """Muestra el estado de recordatorios de reservas pendientes sin enviar nada."""
    ahora_cr = datetime.now(CR_TZ)
    db = SessionLocal()
    try:
        reservas_pendientes = db.query(Reserva).filter(Reserva.estado == "pendiente").all()
        resultado = []
        for r in reservas_pendientes:
            cita_cr = parse_cita_cr(r.fecha, r.hora)
            seg_rest = (cita_cr - ahora_cr).total_seconds() if cita_cr else None
            resultado.append({
                "id": r.id,
                "fecha": r.fecha,
                "hora": r.hora,
                "cita_cr_parsed": cita_cr.isoformat() if cita_cr else None,
                "seg_restantes": round(seg_rest) if seg_rest is not None else None,
                "dia_previo_enviado": bool(r.recordatorio_dia_previo_enviado),
                "1h_enviado": bool(r.recordatorio_1h_enviado),
                "enviaria_dia_previo": debe_enviar_dia_previo(ahora_cr, cita_cr, bool(r.recordatorio_dia_previo_enviado)) if cita_cr else False,
                "enviaria_1h": debe_enviar_1h(ahora_cr, cita_cr, bool(r.recordatorio_1h_enviado)) if cita_cr else False,
            })
        return {
            "ahora_cr": ahora_cr.isoformat(),
            "ventana_1h_min_seg": MIN_SEGUNDOS_ANTES_UNA_HORA,
            "ventana_1h_max_seg": MAX_SEGUNDOS_ANTES_UNA_HORA,
            "reservas": resultado,
        }
    finally:
        db.close()