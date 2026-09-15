# Hospeda

Panel administrativo de Hospeda construido con **Next.js 16**, **React 19**, **Tailwind CSS v4**, **TanStack Query v5** y **lucide-react**.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
# Edita API_URL con la URL de tu backend
npm run dev
```

Las peticiones del navegador se hacen directamente a `NEXT_PUBLIC_API_URL`,
que debe apuntar al backend accesible desde el navegador. El backend debe
permitir el origen del frontend mediante CORS. Las peticiones conservan el token
`Authorization`, cookies, query strings, cuerpos y respuestas del backend.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `API_URL` | URL privada del backend usada por el proxy, sin slash final |
| `NEXT_PUBLIC_APP_ENV` | Entorno lógico (`local`, `development` o `production`) |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend |
| `NEXT_PUBLIC_API_URL` | Fallback del backend para SSR y despliegues anteriores |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout de las peticiones en milisegundos |

El token que devuelve el backend en el login se envía como `Authorization: Bearer`
en cada petición posterior. La API es la responsable de validar permisos y
expiración. El frontend conserva una referencia de sesión para controlar la
navegación y nunca guarda una contraseña.

## Pantallas administrativas

| Ruta | Descripción |
| --- | --- |
| `/` | Landing pública |
| `/login` | Inicio de sesión contra la API externa |
| `/admin` | Resumen de operación |
| `/admin/reservaciones` | Reservaciones |
| `/admin/propiedades` | **Alojamientos > Lista**, con búsqueda y filtros |
| `/admin/propiedades/tipos` | **Alojamientos > Tipos**, CRUD en tarjetas con icono WebP (`id`, `name`, `description`, `icon_url`) |
| `/admin/usuarios` | Usuarios |
| `/admin/configuracion` | Configuración |
| `/admin/configuracion/colonias` | **Configuración > Colonias**, CRUD por país, estado, ciudad, código postal y nombre |
| `/admin/perfil` | Perfil del usuario: foto, nombre y teléfono |

El dropdown del usuario autenticado incluye el acceso **Mi perfil** y **Cerrar
sesión**.

## Contrato mínimo de la API

El cliente usa estos endpoints relativos a `NEXT_PUBLIC_API_URL`:

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me
GET    /dashboard
GET    /properties?search=&status=&city=&propertyType=
GET    /web/admin/lodging-types
POST   /web/admin/lodging-types
PUT    /web/admin/lodging-types/:id
DELETE /web/admin/lodging-types/:id
GET    /locations/countries
GET    /locations/states?countryId=:id
GET    /locations/cities?stateId=:id
GET    /colonies?countryId=&stateId=&cityId=&search=
POST   /colonies
PUT    /colonies/:id
DELETE /colonies/:id
GET/PATCH /users/me
```

El login debe devolver una respuesta con esta forma:

```json
{
  "user": {
    "id": "usr_001",
    "name": "Gabriel Ángel",
    "email": "admin@hospeda.com",
    "phone": "+52 55 1234 5678",
    "role": "admin",
    "photo": null
  },
  "token": "backend-token",
  "expiresAt": "2026-09-22T20:34:04.000Z"
}
```

Las respuestas de listados pueden ser un arreglo o `{ "items": [] }`,
`{ "data": [] }` o `{ "results": [] }`.

El listado de tipos de alojamiento devuelve registros con
`{ "id": number, "name": string, "description": string, "icon_url": string }`.
El alta (`POST`) y la edición (`PUT`) se envían como `multipart/form-data`
con los campos `name`, `description` e `icon`, donde `icon` es un archivo
de imagen en formato **WebP** (en la edición el icono es opcional y solo se
envía cuando se reemplaza).

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
