# Hospeda

Plataforma de hospedaje (tipo Airbnb, con mejoras) construida con **Next.js 16**, **React 19**, **Tailwind CSS v4**, **TanStack Query v5** y **lucide-react**.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # ajusta los valores si hace falta
npm run dev
```

Abre <http://localhost:3000>.

### Cuenta de prueba

Con `AUTH_MODE=mock` (valor por defecto en local):

| Correo               | Contraseña   | Rol   |
| -------------------- | ------------ | ----- |
| admin@hospeda.com    | Hospeda2026  | admin |
| anfitrion@hospeda.com| Hospeda2026  | host  |

## Variables de entorno

| Archivo             | Uso                                                              | ¿Se versiona?        |
| ------------------- | ---------------------------------------------------------------- | -------------------- |
| `.env.example`      | Plantilla de referencia                                          | Sí                   |
| `.env.local`        | Tu entorno local (aquí van secretos de desarrollo)               | No (`.gitignore`)    |
| `.env.development`  | Defaults de `next dev`                                           | Sí (sin secretos)    |
| `.env.production`   | Defaults de `next build` / `next start`                          | Sí (sin secretos)    |

En producción, `AUTH_SECRET` y demás credenciales se inyectan desde el panel de
variables del hosting (Vercel, Docker, CI), **nunca** en un archivo versionado.

| Variable                  | Descripción                                             |
| ------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`     | Entorno lógico (`local`/`development`/`production`)     |
| `NEXT_PUBLIC_APP_URL`     | URL pública del frontend                                |
| `NEXT_PUBLIC_API_URL`     | URL base del backend, sin slash final                   |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout de las peticiones (ms)                          |
| `AUTH_COOKIE_NAME`        | Nombre de la cookie httpOnly de sesión                  |
| `AUTH_SESSION_MAX_AGE`    | Duración de la sesión en segundos                       |
| `AUTH_SECRET`             | Secreto HMAC para firmar tokens en modo `mock`          |
| `AUTH_MODE`               | `mock` (usuarios locales) o `api` (backend real)        |

## Rutas

| Ruta                     | Descripción                          | Protegida |
| ------------------------ | ------------------------------------ | --------- |
| `/`                      | Página principal (landing)           | No        |
| `/login`                 | Inicio de sesión                     | No        |
| `/admin`                 | Panel administrativo (resumen)       | Sí        |
| `/admin/reservaciones`   | Reservaciones                        | Sí        |
| `/admin/propiedades`     | Propiedades                          | Sí        |
| `/admin/usuarios`        | Usuarios                             | Sí        |
| `/admin/configuracion`   | Configuración                        | Sí        |
| `POST /api/auth/login`   | Inicia sesión y emite la cookie      | No        |
| `POST /api/auth/logout`  | Cierra sesión                        | No        |
| `GET  /api/auth/me`      | Usuario de la sesión actual          | Sí        |
| `GET  /api/dashboard`    | Datos del panel                      | Sí        |

Las rutas se centralizan en `lib/routes.ts`.

## Autenticación

El token de sesión se firma con **HMAC-SHA256** (Web Crypto, compatible con el
runtime Edge) y se guarda en una **cookie httpOnly**, por lo que el JavaScript
del navegador no puede leerlo.

La protección tiene dos capas:

1. **`proxy.ts`** (en Next.js 16 el antiguo `middleware.ts` se renombró a
   `proxy.ts`) — comprobación *optimista*: solo verifica que la cookie exista
   para redirigir rápido, sin validar la firma.
2. **`app/admin/layout.tsx` y las rutas de API** — verificación **real** de la
   firma y expiración del token en el servidor. Una cookie falsificada pasa la
   capa 1 pero es rechazada aquí.

### Conectar el backend real

Cambia `AUTH_MODE=api` y apunta `NEXT_PUBLIC_API_URL` a tu servidor. El endpoint
`POST /api/auth/login` dejará de usar los usuarios mock y delegará en
`POST {NEXT_PUBLIC_API_URL}/auth/login`, esperando una respuesta con la forma:

```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "admin" },
  "token": "...", "expiresAt": "2026-09-22T20:34:04.000Z" }
```

## Estructura

```
app/
  api/auth/{login,logout,me}/route.ts   Endpoints de sesión
  api/dashboard/route.ts                Datos del panel (protegido)
  admin/                                Panel administrativo (protegido)
  login/                                Pantalla de inicio de sesión
  page.tsx                              Landing
components/
  admin/                                Sidebar, topbar, tarjetas del panel
lib/
  api-client.ts                         Cliente HTTP (timeout, ApiError)
  auth/                                 Tokens, sesión y usuarios mock
  hooks/                                Hooks de TanStack Query
  query/                                Provider y claves de caché
  env.ts  routes.ts  types.ts  utils.ts
proxy.ts                                Protección de rutas (ex middleware)
```

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm start       # servidor de producción
npm run lint    # ESLint
```
