# Sistema de Afiliados de Hospeda — Documentación de la API

> **Audiencia:** equipo de backend. Este documento define el contrato que el
> frontend ya consume (ver `src/api/affiliates.ts` y `src/api/affiliateAdmin.ts`)
> y todos los ajustes necesarios para implementarlo.
>
> **Estado:** el frontend está completo y compilado contra este contrato. Los
> porcentajes por defecto (3% nivel 1, 2% nivel 2) viven en
> `src/utils/affiliateFallback.ts` como fallback visual hasta que la API
> responda.

---

## 1. Modelo de negocio

```
Afiliado A
 ├── Referido nivel 1 ("hijo") B1  ──  comisión A: level1_percent (ej. 3%)
 │     ├── Referido nivel 2 ("nieto") C1  ──  comisión A: level2_percent (ej. 2%)
 │     ├── Referido nivel 2 ("nieto") C2  ──  comisión A: level2_percent
 │     └── ... (ilimitados)
 ├── Referido nivel 1 ("hijo") B2  ──  comisión A: level1_percent
 │     └── ... (ilimitados)
 └── ... (ilimitados)
```

Reglas:

1. **Anchura ilimitada**: un afiliado puede referir infinitos usuarios de
   nivel 1, y cada usuario de nivel 1 puede referir infinitos de nivel 2.
2. **Profundidad de 2 niveles**: no se pagan comisiones por debajo del nivel 2.
3. **Comisiones configurables**: `level1_percent` y `level2_percent` se leen de
   la configuración (base de datos / settings) y se exponen vía API. Valores
   iniciales: **3%** (nivel 1) y **2%** (nivel 2).
4. **Instantánea de porcentaje**: cada comisión guarda el porcentaje vigente al
   momento de calcularse. Cambiar la configuración no afecta comisiones ya
   generadas.
5. **Atribución**: quien registra con `?ref=CODIGO` queda enlazado a ese
   afiliado. Un usuario solo puede tener un referido (el primero que lo atribuyó).
6. **Ciclo de vida**: las comisiones nacen `pending` cuando hay una reserva
   pagada, pasan a `approved` al confirmarse/completarse, a `paid` cuando se
   incluyen en un retiro liquidado, o `cancelled` si la reserva se cancela.

---

## 2. Base de datos sugerida

> Ajusta tipos y nombres a las convenciones del proyecto (Laravel migrations
> recomendado). Las cantidades monetarias: `DECIMAL(12,2)`; porcentajes:
> `DECIMAL(5,2)`.

### 2.1 `affiliates`

| Campo             | Tipo                        | Notas                                            |
| ----------------- | --------------------------- | ------------------------------------------------ |
| `id`              | BIGINT PK                   |                                                  |
| `user_id`         | BIGINT FK → users, UNIQUE   | usuario con rol `affiliate`                      |
| `code`            | VARCHAR(20) UNIQUE          | código de referido (ej. `ANA-8F3K`)              |
| `referrer_id`     | BIGINT FK → affiliates, NULL| afiliado que lo invitó (primer nivel hacia arriba) |
| `status`          | ENUM: pending/active/suspended/rejected | default `pending` (o `active` si `auto_approve`) |
| `channel_type`    | VARCHAR(50) NULL            | Instagram, TikTok, YouTube…                      |
| `channel_url`     | VARCHAR(255) NULL           | URL o usuario del canal                          |
| `audience_size`   | VARCHAR(50) NULL            | rango de audiencia                               |
| `website`         | VARCHAR(255) NULL           |                                                  |
| `motivation`      | TEXT NULL                   | "¿Por qué quieres ser afiliado?"                 |
| `payout_method`   | ENUM: paypal/spei/bank_transfer/oxxo NULL |                                     |
| `payout_details`  | JSON NULL                   | datos cifrados del método de cobro               |
| `accepted_terms`  | BOOLEAN                     | aceptó términos                                  |
| `accepted_privacy`| BOOLEAN                     | aceptó aviso de privacidad                       |
| `created_at/updated_at` | TIMESTAMP             |                                                  |

> **Simplificación válida:** si prefieres no crear una tabla `affiliates`, el
> espejo mínimo en `users` sería: `affiliate_code`, `affiliate_referrer_id`,
> `affiliate_status`, `payout_method`, `payout_details`. La tabla separada es
> más limpia para reportes.

**Generación del código:** único, legible, mayúsculas. Sugerencia:
`{INICIALES}-{4 alfanuméricos}` (ej. `ANA-8F3K`). Regenerar en colisión.

### 2.2 `affiliate_settings` (singleton)

| Campo                | Tipo           | Default     | Descripción                                |
| -------------------- | -------------- | ----------- | ------------------------------------------ |
| `level1_percent`     | DECIMAL(5,2)   | `3.00`      | % comisión primer nivel (hijos)            |
| `level2_percent`     | DECIMAL(5,2)   | `2.00`      | % comisión segundo nivel (nietos)          |
| `max_levels`         | TINYINT        | `2`         | niveles pagando (máx. soportado: 2)        |
| `min_payout_amount`  | DECIMAL(12,2)  | `500.00`    | mínimo para solicitar retiro               |
| `cookie_days`        | SMALLINT       | `30`        | días de atribución de la cookie `hospeda_ref` |
| `currency`           | CHAR(3)        | `MXN`       | ISO 4217                                   |
| `commission_base`    | ENUM           | `booking_total` | `booking_total` \| `net_revenue`       |
| `auto_approve`       | BOOLEAN        | `false`     | aprobar afiliados al registrarse           |
| `payout_methods`     | JSON           | los 4       | métodos habilitados para retiro            |
| `terms_url`          | VARCHAR NULL   | `null`      | URL pública de términos                    |

Semilla inicial: `level1_percent = 3`, `level2_percent = 2`. Todo lo demás es
editable desde `PUT /api/web/admin/affiliate-settings` (panel
`/admin/affiliates/settings`).

### 2.3 `commissions`

| Campo            | Tipo                         | Notas                                        |
| ---------------- | ---------------------------- | -------------------------------------------- |
| `id`             | BIGINT PK                    |                                              |
| `affiliate_id`   | BIGINT FK → affiliates       | quién cobra                                  |
| `level`          | TINYINT (1 \| 2)             | nivel de la red                              |
| `percent`        | DECIMAL(5,2)                 | instantánea del % al calcular                |
| `base_amount`    | DECIMAL(12,2)                | monto base (reserva)                         |
| `amount`         | DECIMAL(12,2)                | `base_amount * percent / 100`                |
| `currency`       | CHAR(3)                      |                                              |
| `status`         | ENUM: pending/approved/paid/cancelled |                                   |
| `reference_type` | VARCHAR NULL                 | ej. `booking`                                |
| `reference_id`   | BIGINT NULL                  | ej. id de la reserva                         |
| `reference`      | VARCHAR NULL                 | código legible (ej. `RES-1024`)              |
| `referred_user_id`| BIGINT FK → users NULL      | usuario de la red que generó la comisión     |
| `paid_at`        | TIMESTAMP NULL               |                                              |
| `created_at/updated_at` | TIMESTAMP             |                                              |

Índices sugeridos: `(affiliate_id, status)`, `(reference_type, reference_id)`.

### 2.4 `payouts`

| Campo           | Tipo                                     | Notas                        |
| --------------- | ---------------------------------------- | ---------------------------- |
| `id`            | BIGINT PK                                |                              |
| `affiliate_id`  | BIGINT FK → affiliates                   |                              |
| `amount`        | DECIMAL(12,2)                            |                              |
| `currency`      | CHAR(3)                                  |                              |
| `method`        | ENUM: paypal/spei/bank_transfer/oxxo     |                              |
| `status`        | ENUM: requested/processing/paid/rejected | default `requested`          |
| `notes`         | TEXT NULL                                | motivo de rechazo, etc.      |
| `requested_at`  | TIMESTAMP                                |                              |
| `paid_at`       | TIMESTAMP NULL                           |                              |
| `created_at/updated_at` | TIMESTAMP                         |                              |

### 2.5 Tablas existentes que hay que tocar

- `users`: asegurar que el rol `affiliate` exista en el enum de roles (el
  frontend ya lo usa: `UserRole` incluye `affiliate`).
- `reservations` (o donde vive el pago de la reserva): al confirmarse se
  dispara el cálculo de comisiones (ver §4).

---

## 3. Endpoints — Resumen

Base URL: `{VITE_API_BASE_URL}` (default `http://localhost:8000/api`).

| Método | Ruta                                   | Auth     | Uso                                    |
| ------ | -------------------------------------- | -------- | -------------------------------------- |
| GET    | `/affiliates/settings`                 | pública  | % vigentes para landing y registro     |
| GET    | `/affiliates/referrers/{code}`         | pública  | vista previa "Te invita: Ana"          |
| POST   | `/affiliates/register`                 | pública  | registro profesional de afiliado       |
| GET    | `/web/affiliate/profile`               | afiliado | perfil + código + enlace               |
| PUT    | `/web/affiliate/profile`               | afiliado | actualizar perfil y datos de cobro     |
| GET    | `/web/affiliate/stats`                 | afiliado | KPIs del panel                         |
| GET    | `/web/affiliate/referrals`             | afiliado | red 2 niveles (anchura ilimitada)      |
| GET    | `/web/affiliate/commissions`           | afiliado | libro de comisiones                    |
| GET    | `/web/affiliate/payouts`               | afiliado | historial de retiros                   |
| POST   | `/web/affiliate/payouts`               | afiliado | solicitar retiro                       |
| GET    | `/web/admin/affiliates`                | admin    | directorio                             |
| GET    | `/web/admin/affiliates/{id}`           | admin    | detalle                                |
| PATCH  | `/web/admin/affiliates/{id}/status`    | admin    | aprobar/suspender/rechazar             |
| GET    | `/web/admin/affiliate-settings`        | admin    | leer configuración                     |
| PUT    | `/web/admin/affiliate-settings`        | admin    | **configurar % y reglas**              |
| GET    | `/web/admin/commissions`               | admin    | todas las comisiones                   |
| PATCH  | `/web/admin/commissions/{id}`          | admin    | cambiar estado de comisión             |
| GET    | `/web/admin/payouts`                   | admin    | solicitudes de retiro                  |
| PATCH  | `/web/admin/payouts/{id}/pay`          | admin    | marcar retiro como pagado              |
| PATCH  | `/web/admin/payouts/{id}/reject`       | admin    | rechazar retiro                        |

Todas las respuestas usan el envoltorio que el frontend ya resuelve
(`response.data.data ?? response.data`):

```json
{ "success": true, "data": { ... }, "message": "OK" }
```

---

## 4. Lógica de cálculo de comisiones

Disparadores (eventos del dominio de reservas):

| Evento                          | Acción                                                        |
| ------------------------------- | ------------------------------------------------------------- |
| Reserva pagada / confirmada     | crear comisiones `pending` para nivel 1 y 2                   |
| Reserva completada (check-out)  | mover comisiones `pending` → `approved` (habilita retiro)     |
| Reserva cancelada/reembolsada   | mover comisiones `pending`/`approved` → `cancelled`           |
| Pago de retiro liquidado        | comisiones seleccionadas → `paid`                             |

Algoritmo (pseudocódigo):

```
al confirmar_reserva(reserva):
  usuario = reserva.usuario
  afiliado_n1 = usuario.affiliate_referrer        # quién lo invitó
  si afiliado_n1 existe y afiliado_n1.status == 'active':
      base = settings.commission_base == 'booking_total'
             ? reserva.total : reserva.ingreso_neto
      crear commission(
        affiliate: afiliado_n1,
        level: 1,
        percent: settings.level1_percent,   # instantánea
        base_amount: base,
        amount: base * settings.level1_percent / 100,
        status: 'pending',
        referred_user: usuario,
        reference: reserva.codigo
      )

      afiliado_n2 = afiliado_n1.referrer      # el abuelo del usuario
      si afiliado_n2 existe y afiliado_n2.status == 'active' y settings.max_levels >= 2:
          crear commission(
            affiliate: afiliado_n2,
            level: 2,
            percent: settings.level2_percent,   # instantánea
            base_amount: base,
            amount: base * settings.level2_percent / 100,
            status: 'pending',
            referred_user: usuario,
            reference: reserva.codigo
          )
```

Ejemplo numérico (config. default 3% / 2%):

- Ana (afiliada) invita a Beto (nivel 1).
- Beto invita a Carla (nivel 2 de Ana).
- Carla reserva por **$5,000 MXN** (monto base).
- Ana recibe: **$150** (3% · 5,000, nivel 1) + **$100** (2% · 5,000, nivel 2)
  cuando la reserva de Carla se confirme → $250.
- Beto, si además es afiliado activo, recibe **$150** (3% por su referido Carla).

**Importante:** solo se paga a afiliados con `status = 'active'`. Si un usuario
se registra sin `referral_code`, no genera comisiones para nadie (red rota).

---

## 5. Atribución de referidos (tracking)

1. **Enlace:** `https://hospeda.mx/afiliados/registro?ref=ANA-8F3K`.
   El frontend ya lee `?ref=` y lo envía como `referral_code` en el registro.
2. **Cookie:** al abrir cualquier página con `?ref=`, setear cookie
   `hospeda_ref={code}` por `settings.cookie_days` días (default 30).
3. **Registro de usuario normal (no afiliado):** si un usuario se registra con
   cookie `hospeda_ref` válida, enlazarlo igualmente a la red
   (`affiliate_referrer_id`), aunque ese usuario nunca sea afiliado: sus
   reservas generan comisiones para el afiliado. Esta es la mecánica central
   del programa ("personas que agregan").
4. **Primera atribución gana:** si ya tiene referido, no sobrescribir.
5. **Autoreferencia prohibida:** un usuario no puede usar su propio código.

---

## 6. Detalle de endpoints

### 6.1 `GET /affiliates/settings` (público)

Alimenta la landing `/afiliados` y el formulario de registro.

```json
{
  "success": true,
  "data": {
    "level1_percent": 3,
    "level2_percent": 2,
    "max_levels": 2,
    "min_payout_amount": 500,
    "cookie_days": 30,
    "currency": "MXN",
    "commission_base": "booking_total",
    "auto_approve": false,
    "payout_methods": ["paypal", "spei", "bank_transfer", "oxxo"],
    "terms_url": null
  }
}
```

### 6.2 `GET /affiliates/referrers/{code}` (público)

Vista previa del invitador. 200 con `{ "name": "Ana García", "code": "ANA-8F3K" }`
o 404 si el código no existe (el frontend lo tolera y no rompe el formulario).

### 6.3 `POST /affiliates/register` (público)

Crea usuario (rol `affiliate`) + perfil de afiliado. Si `auto_approve = false`,
queda `pending` y el usuario NO inicia sesión automáticamente (la UI muestra
pantalla de éxito con el código asignado).

**Request:**

```json
{
  "name": "Ana García López",
  "email": "ana@correo.com",
  "phone": "+52 55 1234 5678",
  "password": "secreta123",
  "password_confirmation": "secreta123",

  "channel_type": "Instagram",
  "channel_url": "@anaviaja",
  "audience_size": "20,000 – 100,000",
  "website": "https://anablog.com",
  "motivation": "Comparto hospedajes con mi comunidad de viajeros.",

  "payout_method": "spei",
  "payout_details": {
    "clabe": "012345678901234567",
    "bank": "BBVA",
    "beneficiary": "Ana García López"
  },

  "referral_code": "CAR-1Z9X",
  "accept_terms": true,
  "accept_privacy": true
}
```

Notas:

- `payout_details` cambia según `payout_method`:
  - `paypal` → `{ "email": "ana@paypal.com" }`
  - `spei` → `{ "clabe": "…18…", "bank": "…", "beneficiary": "…" }`
  - `bank_transfer` → `{ "bank": "…", "account": "…", "clabe": "…", "beneficiary": "…" }`
  - `oxxo` → `{ "phone": "5512345678" }`
- `referral_code` es opcional. Valido el formato del código y que exista.

**Response 201:**

```json
{
  "success": true,
  "data": {
    "affiliate": {
      "id": 12,
      "code": "ANA-8F3K",
      "status": "pending",
      "...": "..."
    },
    "user": { "id": 87, "name": "Ana García López", "email": "ana@correo.com", "role": "affiliate" },
    "message": "Solicitud enviada"
  }
}
```

**Errores 422** (formato que el frontend ya mapea a campos del formulario):

```json
{
  "success": false,
  "message": "Los datos enviados no son válidos.",
  "errors": {
    "email": ["El correo ya está registrado."],
    "password": ["La contraseña debe tener al menos 8 caracteres."],
    "payout_details.clabe": ["La CLABE debe tener 18 dígitos."],
    "referral_code": ["El código de referido no existe."]
  }
}
```

Validaciones requeridas: `name`, `email` (único), `password` ≥ 8 +
confirmación, `channel_type`, `channel_url`, `payout_method` + sus
`payout_details`, `accept_terms = true`, `accept_privacy = true`.

### 6.4 `GET /web/affiliate/profile`

Devuelve el `Affiliate` completo, incluyendo `code`, `referrer`, contadores y
saldos (ver ejemplo abajo).

### 6.5 `PUT /web/affiliate/profile`

Body parcial (`AffiliatePayload`): `name`, `phone`, `channel_type`,
`channel_url`, `audience_size`, `website`, `payout_method`, `payout_details`.
El correo NO se modifica.

### 6.6 `GET /web/affiliate/stats`

```json
{
  "data": {
    "total_referrals": 670,
    "level1_referrals": 128,
    "level2_referrals": 542,
    "active_referrals": 612,
    "total_earned": 48250.5,
    "pending_amount": 3200,
    "approved_amount": 45050.5,
    "paid_amount": 40000,
    "available_balance": 5050.5,
    "conversion_rate": 34.2,
    "monthly": [
      { "month": "2026-05", "referrals": 12, "earnings": 1800 },
      { "month": "2026-06", "referrals": 19, "earnings": 2450 }
    ]
  }
}
```

### 6.7 `GET /web/affiliate/referrals`

La respuesta modela exactamente el árbol de 2 niveles. Cada nodo de nivel 1
lleva `children` (sus referidos directos = nietos del consultante), con
anchura ilimitada. Query params opcionales: `search`, `level` (filtra).

```json
{
  "data": {
    "level1": [
      {
        "id": 201,
        "name": "Beto Ruiz",
        "email": "beto@correo.com",
        "level": 1,
        "joined_at": "2026-03-02T18:20:00Z",
        "status": "active",
        "channel_type": "TikTok",
        "stats": { "conversions": 8, "generated_amount": 42000, "my_commission": 1260 },
        "children": [
          {
            "id": 305,
            "name": "Carla Díaz",
            "email": "carla@correo.com",
            "level": 2,
            "joined_at": "2026-04-11T16:05:00Z",
            "status": "active",
            "channel_type": "Instagram",
            "stats": { "conversions": 3, "generated_amount": 15000, "my_commission": 300 }
          }
        ]
      }
    ],
    "totals": { "level1": 128, "level2": 542 }
  }
}
```

### 6.8 `GET /web/affiliate/commissions`

Query params: `status`, `level`, `page`. Response:

```json
{
  "data": {
    "items": [
      {
        "id": 9001,
        "affiliate_id": 12,
        "level": 2,
        "percent": 2,
        "base_amount": 5000,
        "amount": 100,
        "currency": "MXN",
        "status": "approved",
        "reference": "RES-1024",
        "referred_user": { "id": 87, "name": "Carla Díaz" },
        "created_at": "2026-06-02T14:00:00Z",
        "paid_at": null
      }
    ],
    "total": 670,
    "pending_amount": 3200
  }
}
```

### 6.9 `POST /web/affiliate/payouts`

```json
{ "amount": 2500, "method": "spei", "payout_details": { "clabe": "…", "bank": "…", "beneficiary": "…" } }
```

Validar: `amount ≥ settings.min_payout_amount`, `amount ≤ saldo disponible`,
método habilitado en `settings.payout_methods`. El saldo disponible =
comisiones `approved` no incluidas en un payout.

### 6.10 Admin

- `GET /web/admin/affiliates?status=&search=` → lista de `Affiliate` con
  `level1_count`, `level2_count`, `total_earned`, `balance`.
- `PATCH /web/admin/affiliates/{id}/status` body `{ "status": "active" }`
  (acepta `pending|active|suspended|rejected`). Al aprobar, enviar email de
  bienvenida con el código y el enlace.
- `GET|PUT /web/admin/affiliate-settings` → objeto de §2.2 / §6.1. El `PUT`
  acepta parcial y devuelve la configuración resultante. **Este es el punto de
  configuración de los porcentajes que pide el negocio.**
- `GET /web/admin/commissions?status=&level=&affiliate_id=&page=`.
- `PATCH /web/admin/commissions/{id}` body `{ "status": "approved" | "cancelled" | "paid" }`.
- `GET /web/admin/payouts?status=&page=` → `{ items, total }`.
- `PATCH /web/admin/payouts/{id}/pay` → marca `paid`, liquida las comisiones
  asociadas y setea `paid_at`.
- `PATCH /web/admin/payouts/{id}/reject` body `{ "notes": "motivo" }`.

---

## 7. Objeto `Affiliate` (referencia)

```json
{
  "id": 12,
  "user_id": 87,
  "name": "Ana García López",
  "email": "ana@correo.com",
  "phone": "+52 55 1234 5678",
  "code": "ANA-8F3K",
  "status": "active",
  "channel_type": "Instagram",
  "channel_url": "@anaviaja",
  "audience_size": "20,000 – 100,000",
  "website": "https://anablog.com",
  "motivation": "…",
  "payout_method": "spei",
  "payout_details": { "clabe": "012345678901234567", "bank": "BBVA", "beneficiary": "Ana García López" },
  "level1_count": 128,
  "level2_count": 542,
  "balance": 5050.5,
  "total_earned": 48250.5,
  "referrer": { "id": 3, "name": "Carlos Pérez", "code": "CAR-1Z9X" },
  "created_at": "2026-02-14T18:00:00Z",
  "updated_at": "2026-06-20T12:00:00Z"
}
```

> `payout_details` es información sensible: considera no exponerlo completo al
> propio afiliado (solo los últimos 4 dígitos / máscara) y cifrarlo en BD.

---

## 8. Errores y códigos HTTP

| Código | Cuándo                                                         |
| ------ | -------------------------------------------------------------- |
| 200/201| éxito                                                          |
| 401    | token inválido (el interceptor del frontend redirige al login) |
| 403    | afiliado inactivo/suspendido intentando operar                 |
| 404    | código de referido inexistente (solo en `referrers/{code}`)    |
| 422    | validación (formato `errors: { campo: [mensajes] }`)           |
| 429    | rate limit en registro público                                 |

Formato de error (consistente con el resto de la plataforma):

```json
{ "success": false, "message": "…", "errors": { "campo": ["mensaje"] } }
```

---

## 9. Pruebas rápidas (cURL)

```bash
# Configuración pública (porcentajes vigentes)
curl -s http://localhost:8000/api/affiliates/settings | jq

# Vista previa del invitador
curl -s http://localhost:8000/api/affiliates/referrers/ANA-8F3K | jq

# Registro de afiliado con referido
curl -s -X POST http://localhost:8000/api/affiliates/register \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{
    "name": "Ana García",
    "email": "ana@correo.com",
    "password": "secreta123",
    "password_confirmation": "secreta123",
    "channel_type": "Instagram",
    "channel_url": "@anaviaja",
    "payout_method": "paypal",
    "payout_details": { "email": "ana@paypal.com" },
    "referral_code": "CAR-1Z9X",
    "accept_terms": true,
    "accept_privacy": true
  }' | jq

# Configurar porcentajes (admin; requiere Bearer token)
curl -s -X PUT http://localhost:8000/api/web/admin/affiliate-settings \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "level1_percent": 3, "level2_percent": 2, "max_levels": 2 }' | jq

# Red de referidos del afiliado autenticado
curl -s http://localhost:8000/api/web/affiliate/referrals \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 10. Notas de implementación (Laravel sugerido)

1. **Middleware:** `auth:api` para rutas `/web/affiliate/*` (rol `affiliate`)
   y `/web/admin/*` (rol `administrator`). El frontend ya envía
   `Authorization: Bearer {token}`.
2. **Eventos:** `ReservationPaid`, `ReservationCompleted`,
   `ReservationCancelled` → listener `GenerateAffiliateCommissions`.
   Idempotencia por `(reference_type, reference_id, affiliate_id, level)`.
3. **Jobs:** cálculo de comisiones en cola (no bloquear el checkout).
4. **Observers vs. Services:** encapsular §4 en un servicio
   `AffiliateCommissionService` testeable.
5. **Emails:** (a) bienvenida al aprobar afiliado, (b) nueva comisión, (c)
   estado de retiro. Plantillas pendientes (no bloquean el frontend).
6. **Seeders:** crear fila en `affiliate_settings` con 3%/2%.
7. **Roles:** añadir `affiliate` al enum de `users.role` (el frontend ya lo
   envía desde el formulario de usuarios del admin).

---

## 11. Mapa frontend ↔ API

| UI (ruta)                            | Componente                                  | API                                                     |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------------- |
| `/afiliados`                         | `pages/affiliates/AffiliatesLanding.tsx`    | `GET /affiliates/settings`                              |
| `/afiliados/registro`                | `pages/affiliates/AffiliateRegister.tsx`    | `GET /affiliates/settings`, `GET /affiliates/referrers/{code}`, `POST /affiliates/register` |
| `/affiliate/dashboard`               | `pages/affiliate/Dashboard.tsx`             | `GET /web/affiliate/profile|stats|referrals`            |
| `/affiliate/referrals`               | `pages/affiliate/Referrals.tsx`             | `GET /web/affiliate/referrals`                          |
| `/affiliate/commissions`             | `pages/affiliate/Commissions.tsx`           | `GET /web/affiliate/commissions`                        |
| `/affiliate/payouts`                 | `pages/affiliate/Payouts.tsx`               | `GET|POST /web/affiliate/payouts`                       |
| `/affiliate/profile`                 | `pages/affiliate/Profile.tsx`               | `GET|PUT /web/affiliate/profile`                        |
| `/admin/affiliates`                  | `pages/admin/affiliates/AffiliateList.tsx`  | `GET /web/admin/affiliates`, `PATCH …/status`           |
| `/admin/affiliates/settings`         | `pages/admin/affiliates/AffiliateSettingsPage.tsx` | `GET|PUT /web/admin/affiliate-settings`          |

Tipos TypeScript del contrato: `src/types/affiliate.ts`.
Clientes HTTP: `src/api/affiliates.ts`, `src/api/affiliateAdmin.ts`.
Fallback visual de configuración (hasta que la API viva): `src/utils/affiliateFallback.ts`.
