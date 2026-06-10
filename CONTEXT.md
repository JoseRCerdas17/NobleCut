# Visionary Studio Barber Shop — Project Context

> Comprehensive reference for AI agents and developers working on this codebase.
> Last updated from codebase scan: June 2026.

---

## 1. Project Overview

**Visionary Studio Barber Shop** is a full-stack web platform for a premium barbershop in **Liberia, Guanacaste, Costa Rica**. It provides:

- A marketing **landing page** (black & gold premium design)
- A **public booking flow** (`/reservar`) with barber selection, service selection, calendar, and time slots
- An **admin panel** (`/admin`) for managing appointments, payments, income reports, and schedule blocking
- **Email notifications** (confirmation + automated reminders) via Resend
- **Self-service cancellation** via email link (`/cancelar?id={reserva_id}`)

**Production domain:** `https://visionarystudiobarbershop.com`

**Owner / master barber:** Alonso "Lobo" Lobo (`@lobo_barbero` on Instagram)

**Note:** The root `README.md` is outdated (still references "NobelCut" / "Evolution X"). The live brand and API title are **Visionary Studio**.

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.1 | App Router, SSR/CSR hybrid |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling (`@import "tailwindcss"`, `@theme` tokens) |
| react-calendar | ^6.0.0 | Date picker in booking flow |
| Google Fonts | Montserrat + Playfair Display | Typography |

**Deploy:** Vercel

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.136.1 | REST API |
| Uvicorn | 0.46.0 | ASGI server |
| SQLAlchemy | 2.0.49 | ORM |
| SQLite (local) / PostgreSQL (prod) | — | Database |
| python-jose + bcrypt | — | JWT auth |
| APScheduler | 3.11.2 | Reminder cron jobs |
| Resend | 2.29.0 | Transactional email |
| pydantic | 2.13.3 | Request/response validation |

**Deploy:** Railway (`Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port 8000`)

---

## 3. Folder Structure

```
visionary-studio/
├── CONTEXT.md                 ← This file
├── README.md                  ← Outdated; see this file instead
├── .gitignore
│
├── backend/
│   ├── main.py                ← FastAPI app, lifespan, health endpoints
│   ├── Procfile               ← Railway start command
│   ├── requirements.txt
│   ├── emails.py              ← Confirmation & admin notification emails
│   ├── recordatorios.py       ← APScheduler + reminder email sending
│   ├── recordatorios_logic.py ← Pure reminder logic (testable, no I/O)
│   ├── auth/
│   │   └── security.py        ← bcrypt + JWT helpers
│   ├── database/
│   │   └── connection.py      ← Engine, session, migration helpers
│   ├── models/
│   │   └── reserva.py         ← Only DB model (Reserva)
│   ├── routers/
│   │   ├── auth.py            ← Login + token verification
│   │   └── reservas.py        ← All reservation CRUD + blocking
│   └── tests/
│       └── test_recordatorios.py
│
└── frontend/
    ├── AGENTS.md / CLAUDE.md  ← Next.js 16 agent notes
    ├── app/                   ← Next.js App Router
    │   ├── layout.tsx         ← Root layout (fonts, floating buttons)
    │   ├── page.tsx           ← Landing page
    │   ├── globals.css        ← Tailwind theme + calendar styles
    │   ├── sitemap.ts
    │   ├── reservar/page.tsx  ← Public booking wizard
    │   ├── login/page.tsx     ← Admin login
    │   ├── admin/
    │   │   ├── page.tsx       ← Full admin panel (main)
    │   │   └── reservas/page.tsx  ← Stub/placeholder only
    │   ├── cancelar/page.tsx  ← Self-service cancellation
    │   └── components/
    │       ├── layout/        ← Navbar, Footer
    │       ├── sections/      ← Hero, Servicios, Galeria, Equipo, Contacto
    │       └── ui/            ← WhatsAppButton, LocationButton
    ├── lib/
    │   └── barberos.ts        ← Barber config + time slot definitions
    └── public/                ← Static assets (logo, photos, favicons, barberia.mp4)
```

---

## 4. Frontend Routes & Pages

| Route | File | Auth | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Landing: Hero → Servicios → Galeria → Equipo → Contacto |
| `/reservar` | `app/reservar/page.tsx` | Public | 4-step booking wizard |
| `/cancelar?id={id}` | `app/cancelar/page.tsx` | Public | Cancels reservation via API link from email |
| `/login` | `app/login/page.tsx` | Public | Admin login → stores JWT in `localStorage` |
| `/admin` | `app/admin/page.tsx` | JWT required | Full admin dashboard |
| `/admin/reservas` | `app/admin/reservas/page.tsx` | — | **Unused stub** — all admin logic is in `/admin` |

### Floating UI (non-admin pages only)
- `WhatsAppButton` — bottom-right, links to `https://wa.me/50662009558`
- `LocationButton` — above WhatsApp, links to Google Maps

Hidden on `/admin` and `/login` via `usePathname()` check in `layout.tsx`.

---

## 5. Business Domain

### Barbershop Info
- **Location:** Liberia, Guanacaste, Costa Rica
- **Google Maps:** `https://maps.app.goo.gl/zcfrCQAJDv4KLDfb9`
- **WhatsApp:** +506 6200-9558 (`https://wa.me/50662009558`)
- **Instagram:** `@lobo_barbero`
- **Hours (display):** Mon–Sat 8:30 AM – 6:00 PM; Sunday closed
- **Payment:** At appointment (no online payment). Admin records payment method after service.

### Services (hardcoded in frontend)
Defined in both `app/reservar/page.tsx` and `app/components/sections/Servicios.tsx`:

| Service | Price (CRC) | Duration |
|---|---|---|
| Corte de Cabello | ₡4,000 | 30 min |
| Corte y Barba | ₡5,000 | 30 min |
| Marcado y/o Barba | ₡2,000 | 15 min |
| Cejas | ₡1,000 | 5 min |

**Important:** Service duration is informational only. Slot availability is determined by the barber's fixed time grid, not by service length. There is no overlap/blocking logic beyond exact time slot matching.

### Barbers (config: `frontend/lib/barberos.ts`)
Barbers, specialties, and available time slots are **frontend-only config** (not in DB). The barber name string is stored on each reservation.

| ID | Name | Specialty | Slot interval | Slots |
|---|---|---|---|---|
| 1 | Alonso Lobo | Owner & Master Barber | 30 min | 8:30, 9:00, 9:30, 10:00, 10:30 AM · 1:00, 1:30, 2:00, 3:00, 3:30, 4:30, 5:00, 5:30, 6:00, 6:30 PM |
| 2 | Axel Ruiz | Barbero · Cortes y Diseños | 45 min | 8:30, 9:15, 10:00, 10:45 AM · 1:00, 1:45, 2:30, 3:15, 4:00, 4:45, 5:30, 6:15 PM |

Each barber has an **independent schedule**. Two barbers can have appointments at the same clock time (different slot grids). Uniqueness is enforced per `(fecha, hora, barbero)`.

The landing page **Equipo** section (`components/sections/Equipo.tsx`) has two rows:

1. **Barber grid** (`md:grid-cols-2`) — Lobo and Axel side-by-side on tablet+, stacked on mobile. Each card: subtitle, heading, description, photo (Lobo uses `lobo3.jpeg`, Axel uses initials "AR" placeholder), name/role, "Reservar con..." button, 3 stat cards.
   - Lobo stats: 5+ Años, 100% Dedicación, 4 Servicios
   - Axel stats: Fades, Diseños, 17 Años
2. **Opiniones** — full-width centered (`max-w-2xl mx-auto`) below both barbers. Empty state with star icons and WhatsApp CTA.

Layout is mobile-first: stats use `text-[10px] md:text-xs` labels, `text-base md:text-xl` values, `gap-3 md:gap-4` spacing. Photo containers use `w-full` with `aspect-square`.

---

## 6. Booking Flow (`/reservar`)

### Steps
1. **Barbero** — select from `BARBEROS`
2. **Servicio** — select from hardcoded services list
3. **Fecha y Hora** — calendar + time slot grid (barber-specific slots)
4. **Confirmar** — client name, phone, email → POST to API

### Date Rules
- **Sundays disabled** (`date.getDay() === 0`)
- **Range:** today through +7 days only
- **Past slots today:** disabled if less than 5 minutes remain before slot time
- Date format sent to API: `toLocaleDateString("es-CR")` → **`DD/MM/YYYY`**
- Time format: **`H:MM AM/PM`** (e.g. `"5:00 PM"`)

### Occupied Slots
```
GET /reservas/ocupados?fecha={DD/MM/YYYY}&barbero={nombre}
```
Returns array of occupied time strings for that barber on that date (excludes `cancelada`).

### Client Data Persistence
Name, phone, email saved to `localStorage`:
- `cliente_nombre`
- `cliente_telefono`
- `cliente_email`

### On Success
Shows confirmation screen. Backend sends confirmation email to client.

---

## 7. Reservation States

| Estado | Meaning | Visible in admin list | Blocks slot |
|---|---|---|---|
| `pendiente` | Booked, awaiting appointment | Yes | Yes |
| `confirmada` | Service completed, payment recorded | Yes | Yes |
| `cancelada` | Cancelled by client or admin | Canceladas view only | No |
| `bloqueado` | Admin-blocked time slot (pseudo-reservation) | No (filtered out) | Yes |

### State Transitions
- **Create booking** → `pendiente`
- **Admin confirms payment** (✓ button) → `confirmada` + `metodo_pago` JSON stored
- **Admin cancel** (✕) or **client link** → `cancelada` + `cancelada_en` timestamp
- **Admin restore** → `pendiente`, clears `cancelada_en`
- **Admin block slot** → creates row with `estado: "bloqueado"`
- **Admin delete** → permanent removal (admin auth required)

### Cancelled Retention
- Cancelled reservations kept **7 days** (`DIAS_RETENCION_CANCELADAS`)
- Admin can purge old cancelled via `DELETE /reservas/limpiar-canceladas-viejas`

---

## 8. Admin Panel (`/admin`)

Single large client component (~1240 lines). Four views via tab switcher:

| Vista | Purpose |
|---|---|
| **Lista** | Filterable/searchable reservation list |
| **Calendario** | Month grid + day detail + slot blocking |
| **Ingresos** | Revenue dashboard (day/week/month) |
| **Canceladas** | Recently cancelled reservations (max 5 shown in list filter) |

### Auth Flow
1. Login at `/login` → `POST /auth/login` (OAuth2 form: username + password)
2. JWT stored as `localStorage.admin_token`; `usuario_rol` and `usuario_barbero` stored alongside
3. On `/admin` load: verifies token via `GET /auth/verificar`, receives `{ username, rol, barbero }`
4. **Profile switching (admin only):** Lobo logs in once and switches between "Ver todos", "Ver como Lobo", "Ver como Axel" via buttons at the top of the admin panel. The selected profile is stored in `localStorage.perfil_actual`. The API call to `GET /reservas/` includes a `?barbero=` query param when a specific barber is selected.
5. Barber accounts (`axel`) have no switcher — they always see only their own reservations (`rol: "barber"`).
6. All authenticated API calls use header: `Authorization: Bearer {token}`

### Filters (Lista view)
- `pendiente` (default), `confirmada`, `cancelada`, `todas`
- Text search: name, phone, service

### Payment Modal
When admin clicks ✓ on a `pendiente` reservation, a modal records payment:

**Methods:** SINPE, Efectivo, Mixto (SINPE + Efectivo split)

**Optional extras:**
- Propina (tip in colones)
- Pago en dólares (USD amount, converted to CRC for income totals using live exchange rate from `https://api.exchangerate-api.com/v4/latest/USD`, fallback ₡520/USD)

**Stored format:** JSON string in `metodo_pago` column:
```json
// SINPE or Efectivo
{ "tipo": "sinpe", "monto": 4000, "propina": { "monto": 500 }, "dolares": null }

// Mixto
{ "tipo": "mixto", "montoSinpe": 2000, "montoEfectivo": 2000, "monto": 4000 }

// USD payment
{ "tipo": "efectivo", "monto": null, "propina": null, "dolares": { "monto": 20 } }
```

Legacy plain strings `"sinpe"` / `"efectivo"` are also parsed for backward compatibility.

### Income Calculations
Only `confirmada` reservations count toward income.

```
ingreso_colones = base_monto + propina + (dolares * tipo_cambio)
```

Broken down by SINPE / Efectivo / propinas / dólares for day, rolling 7-day week, and current month.

### Calendar & Slot Blocking
- Select a day in month calendar → shows that day's appointments (all barbers)
- **Barber selector** for blocking section → shows that barber's slot grid
- Click empty slot → block; click blocked slot → unblock
- Bulk: "Bloquear día" / "Desbloquear día" for selected barber
- Blocked slots stored as `estado: "bloqueado"` reservations (not a separate table)

---

## 9. Database

### Engine
- **Local default:** SQLite → `sqlite:///./visionary_studio.db`
- **Production:** PostgreSQL via `DATABASE_URL` env var
- Auto-creates tables on startup: `Base.metadata.create_all(bind=engine)`
- Manual column migrations via `ensure_reserva_reminder_columns()` and `ensure_cancelada_en_column()` for existing DBs

### Model: `Reserva` (`backend/models/reserva.py`)

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `nombre` | String | Client full name |
| `telefono` | String | Phone |
| `email` | String | Email |
| `barbero` | String | Barber display name (from frontend config) |
| `servicio` | String | Service name |
| `precio` | String | Price string e.g. `"₡4,000"` |
| `fecha` | String | `DD/MM/YYYY` (es-CR format) |
| `hora` | String | `"H:MM AM/PM"` |
| `estado` | String | Default `"pendiente"` |
| `metodo_pago` | String, nullable | JSON string or legacy plain text |
| `creado_en` | DateTime | UTC, default `datetime.utcnow` |
| `recordatorio_dia_previo_enviado` | Boolean | Default False |
| `recordatorio_1h_enviado` | Boolean | Default False |
| `cancelada_en` | DateTime, nullable | Set on cancellation |

**There is only one table for reservations.** User accounts are stored in a separate `usuarios` table (see below). No barbers table, no services table.

### Model: `Usuario` (`backend/models/usuario.py`)

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `username` | String, unique | Login username, indexed |
| `password_hash` | String | bcrypt hash |
| `rol` | String | `"admin"` or `"barber"` |
| `barbero` | String, nullable | Which barber's bookings this user manages (null for admin = all) |
| `creado_en` | DateTime | UTC, default `datetime.utcnow` |

**Seeded accounts** (created on first startup via `seed_usuarios()` in `main.py`, driven by `.env` vars):

| Env var | Default | Notes |
|---|---|---|
| `BARBER_1_USERNAME` | `lobo` | Admin account |
| `BARBER_1_PASSWORD` | `lobo2026` | |
| `BARBER_1_IS_ADMIN` | `true` | Admin sees all barbers |
| `BARBER_2_USERNAME` | `axel` | Barber account |
| `BARBER_2_PASSWORD` | `axel2026` | |
| `BARBER_2_IS_ADMIN` | `false` | Barber sees only own bookings |

To add a third barber, add `BARBER_3_USERNAME`, `BARBER_3_PASSWORD`, `BARBER_3_IS_ADMIN` to `.env` and add `i in [1, 2, 3]` to `_barberos_from_env()` in `main.py`.

---

## 10. API Endpoints

Base URL: `{API}/` (local: `http://localhost:8000`)

Interactive docs: `{API}/docs` (Swagger UI)

### Root & Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | `{ "message": "Visionary Studio API funcionando" }` |
| GET | `/health/reminders` | No | Scheduler status, Resend key configured, next run time |
| GET | `/health/reminders/debug` | No | Pending reservations reminder eligibility debug |

### Auth (`/auth`)

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| POST | `/auth/login` | No | Form: `username`, `password` | `{ access_token, token_type: "bearer" }` |
| GET | `/auth/verificar` | Bearer | — | `{ username, rol, barbero }` |
| GET | `/auth/usuarios` | Admin | — | List all users `[{ username, rol, barbero }]` |

JWT payload includes `sub` (username), `rol` (`"admin"` or `"barber"`), and `barbero` (barber name string or empty). JWT expires in **24 hours** (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24`).

### Reservas (`/reservas`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reservas/` | No | Create reservation. Conflict if same fecha+hora+barbero exists (non-cancelled). Sends confirmation email. |
| GET | `/reservas/` | **Bearer** | List reservations. Optional query: `?barbero=Nombre`. Admins see all or filter by barber; barbers see only their own. |
| GET | `/reservas/ocupados` | No | Query: `fecha`, `barbero`. Returns occupied hour strings. |
| POST | `/reservas/bloqueos` | Admin | Body: `{ fecha, hora, barbero }`. Creates blocked slot. |
| DELETE | `/reservas/bloqueos` | Admin | Query: `fecha`, `hora`, `barbero`. Removes block. |
| GET | `/reservas/{reserva_id}` | No | Get single reservation |
| GET | `/reservas/cancelar/{reserva_id}` | No | Client self-cancel via email link |
| PATCH | `/reservas/{reserva_id}` | No ⚠️ | Body: `{ estado, metodo_pago? }`. Update status/payment. |
| DELETE | `/reservas/{reserva_id}` | No ⚠️ | Soft cancel (sets `cancelada`) |
| PATCH | `/reservas/restaurar/{reserva_id}` | Admin | Restore cancelled → pendiente |
| DELETE | `/reservas/eliminar/{reserva_id}` | Admin | Hard delete |
| DELETE | `/reservas/limpiar-canceladas-viejas` | Admin | Purge cancelled older than 7 days |

### Request/Response Schemas

**ReservaCreate:**
```json
{
  "nombre": "string",
  "telefono": "string",
  "email": "string",
  "barbero": "string",
  "servicio": "string",
  "precio": "string",
  "fecha": "DD/MM/YYYY",
  "hora": "H:MM AM/PM"
}
```

**Error on duplicate slot:** HTTP 400, `{ "detail": "Ya existe una reserva para esa fecha y hora" }`

---

## 11. Email System

**Provider:** Resend  
**From address:** `Visionary Studio <reservas@visionarystudiobarbershop.com>`

### Confirmation Email (`emails.enviar_confirmacion_cliente`)
- Triggered on `POST /reservas/`
- HTML template with brand colors (#0A0A0A, #C9A035)
- Includes: service, date, time, **barbero name**, price, maps link, WhatsApp, Instagram, cancel link
- `barbero` param passed dynamically from the reservation

### Admin Notification (`emails.enviar_notificacion_admin`)
- Function exists but is **NOT called** from `crear_reserva` currently
- Would send to `jose12roberto17@gmail.com`

### Reminder Emails (`recordatorios.enviar_recordatorio`)
Automated via APScheduler, timezone `America/Costa_Rica`: `barbero` param passed dynamically from the reservation; displayed in the details table alongside service, date, and time.

| Type | When sent | Subject |
|---|---|---|
| `dia_previo` | Day before appointment, from 14:00 CR onward | "Recordatorio: Tu cita es mañana" |
| `1h` | 52–68 minutes before appointment | "Recordatorio: Tu cita es en 1 hora" |

Scheduler runs every **3 minutes** (`TICK_MINUTES = 3`). Only processes `estado == "pendiente"` reservations.

Disable scheduler: `DISABLE_REMINDER_SCHEDULER=true` (important for multi-replica deployments — only one instance should run reminders).

Cancel link in emails: `{FRONTEND_URL}/cancelar?id={reserva_id}`

---

## 12. Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Prod yes | `sqlite:///./visionary_studio.db` | PostgreSQL or SQLite connection string |
| `SECRET_KEY` | Prod yes | `evolution-x-secret-key-2026` | JWT signing key |
| `BARBER_1_USERNAME` | No | `lobo` | Admin login username |
| `BARBER_1_PASSWORD` | Prod yes | `lobo2026` | Admin password (bcrypt hashed at startup) |
| `BARBER_1_IS_ADMIN` | No | `true` | Set `false` to make this account a barber-only account |
| `BARBER_2_USERNAME` | No | `axel` | Barber login username |
| `BARBER_2_PASSWORD` | Prod yes | `axel2026` | Barber password |
| `BARBER_2_IS_ADMIN` | No | `false` | Set `true` to give this barber admin access |
| `RESEND_API_KEY` | Prod yes | — | Resend email API key |
| `FRONTEND_URL` | Prod yes | `http://localhost:3000` | Used in email cancel/confirmation links |
| `DISABLE_REMINDER_SCHEDULER` | No | — | Set `true`/`1`/`yes`/`on` to disable APScheduler |

### Frontend (`frontend/.env.local`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Prod yes | `http://localhost:8000` | Backend API base URL |

---

## 13. Design System

### Color Palette (`frontend/app/globals.css` — `@theme`)

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#E0B84C` | Primary accent, buttons, highlights |
| `gold-light` | `#F0C95A` | Gradients, hover accents |
| `gold-dark` | `#B8872E` | Gradient start |
| `gold-muted` | `#C9A035` | Email templates, calendar active |
| `dark` | `#0A0A0A` | Page background |
| `dark-card` | `#1A1A1A` | Cards, panels |
| `dark-surface` | `#2D2D2D` | Secondary surfaces |
| `dark-border` | `#2A2A2A` | Borders |

**Additional inline colors used:**
- Body fallback background: `#1A1A1A`
- Calendar background: `#252525`
- Calendar active/hover gold: `#D4A017`
- Button hover: `#A07828`
- WhatsApp green: `#25D366`
- Floating buttons: `#D4A017`

**Email template colors:** `#0A0A0A`, `#1A1A1A`, `#111`, `#C9A035`, `#E8B84B`, `#2A2A2A`

### Typography
- **Primary (body):** Montserrat (`--font-sans`)
- **Accent (headings in cancel page):** Playfair Display (`--font-serif`), also Georgia fallback inline
- Style: uppercase headings, wide letter-spacing (`tracking-widest`, `tracking-[4px]`)

### Component Classes
```css
.btn-gold       /* Gold filled button */
.btn-outline    /* Gold border, hover fill */
.section-padding /* Responsive section spacing */
```

### Design Language
- Premium black & gold aesthetic
- Heavy use of uppercase, italic gold accents
- Dark cards with subtle borders
- Responsive: mobile-first, hamburger nav on small screens

---

## 14. External Integrations

| Service | URL / ID | Used for |
|---|---|---|
| Resend | API key env | Transactional emails |
| Google Maps | `maps.app.goo.gl/zcfrCQAJDv4KLDfb9` | Location links |
| WhatsApp | `wa.me/50662009558` | Contact button, admin WA links |
| Instagram | `@lobo_barbero` | Social links |
| Exchange Rate API | `api.exchangerate-api.com/v4/latest/USD` | USD→CRC in admin income (fallback 520) |

---

## 15. Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
# Create backend/.env with required vars
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
# Create frontend/.env.local with NEXT_PUBLIC_API_URL
npm run dev
# → http://localhost:3000
```

### Tests
```bash
cd backend
python -m unittest tests.test_recordatorios
```
Tests cover `recordatorios_logic.py` (date parsing, reminder window logic). No frontend tests.

---

## 16. Deployment Notes

- **Frontend:** Vercel (auto from git)
- **Backend:** Railway via `Procfile`
- **Database:** PostgreSQL on Railway in production
- **CORS:** Wide open (`allow_origins=["*"]`) — all methods/headers allowed
- **Multi-replica:** Set `DISABLE_REMINDER_SCHEDULER=true` on all but one backend instance to avoid duplicate reminder emails

---

## 17. Known Quirks & Technical Debt

1. **README outdated** — references NobelCut/Evolution X; actual brand is Visionary Studio
2. **`GET /reservas/` requires auth** — but any authenticated user can list all reservations (no per-user filtering beyond optional `barbero` query)
3. **`PATCH /reservas/{id}` and `DELETE /reservas/{id}` have no auth** — status can be changed without token
4. ~~**Confirmation email barber name hardcoded** to Alonso Lobo in `emails.py` line 58~~ — resolved: `barbero` param now passed dynamically to both confirmation and reminder emails
5. **`enviar_notificacion_admin` never called** on new bookings
6. **Services & barbers are frontend-only** — changing prices/names requires code edits in multiple files
8. **`/admin/reservas` is an empty stub** — all admin functionality lives in `/admin/page.tsx`
9. **`app/page.tsx` metadata export** appears after default export (likely broken/unused metadata)
10. **`layout.tsx` is `"use client"`** — cannot export static metadata from layout
11. **No overlap detection** — booking blocks only the exact slot time, not a duration window
12. **Barber passwords hashed at startup** — changing `BARBER_*_PASSWORD` env requires server restart
13. **Legacy `DATABASE_URL` default** — local default was `sqlite:///./evolution_x.db`; current uses `visionary_studio.db`

---

## 18. Key Files Quick Reference

| Task | File(s) to edit |
|---|---|
| Add/change barber or time slots | `frontend/lib/barberos.ts` |
| Change services/prices | `frontend/app/reservar/page.tsx`, `frontend/app/components/sections/Servicios.tsx` |
| Booking business rules (dates, limits) | `frontend/app/reservar/page.tsx` |
| Admin panel features | `frontend/app/admin/page.tsx` |
| API endpoints / validation | `backend/routers/reservas.py` |
| DB schema | `backend/models/reserva.py` + migration helpers in `database/connection.py` |
| Email templates | `backend/emails.py`, `backend/recordatorios.py` |
| Reminder timing logic | `backend/recordatorios_logic.py` |
| Auth / JWT | `backend/routers/auth.py`, `backend/auth/security.py` |
| Colors / global styles | `frontend/app/globals.css` |
| Landing page sections | `frontend/app/components/sections/*.tsx` |

---

## 19. Date/Time Conventions (Critical)

All reservation date/time handling assumes **Costa Rica local time**:

- **Storage format:** strings, not native DB datetime for appointment time
- **Date:** `DD/MM/YYYY` via `toLocaleDateString("es-CR")`
- **Time:** 12-hour `"H:MM AM/PM"` (single-digit hours OK, e.g. `"9:00 AM"`)
- **Parsing:** `recordatorios_logic.parse_cita_cr(fecha, hora)` → timezone-aware `America/Costa_Rica`
- **Calendar locale:** `es-ES` in react-calendar

When modifying scheduling, always test with CR timezone semantics.

---

## 20. Contact & Ownership

- **Developer:** José Roberto — [@JoseRCerdas17](https://github.com/JoseRCerdas17)
- **License:** MIT (per README)
