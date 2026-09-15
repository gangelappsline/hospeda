# Hospeda

Panel administrativo de Hospeda construido con **Next.js 16**, **React 19**, **Tailwind CSS v4**, **TanStack Query v5** y **lucide-react**.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
# Edita API_URL con la URL de tu backend
npm run dev
```

Las peticiones del navegador se hacen a la ruta same-origin `/api`. El Route
Handler de Next.js las reenvía desde el servidor a `API_URL`, por lo que el
navegador no se comunica directamente con el backend ni depende de su
configuración CORS. El proxy conserva `Authorization`, cookies, query strings,
cuerpos y respuestas de la API.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `API_URL` | URL base del backend usada **solo en el servidor** por el proxy, sin slash final |
| `NEXT_PUBLIC_APP_ENV` | Entorno lógico (`local`, `development` o `production`) |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout de las peticiones en milisegundos |

`NEXT_PUBLIC_API_URL` se acepta temporalmente como fallback para despliegues
anteriores, pero debe migrarse a `API_URL`. No la uses en configuraciones nuevas:
la URL de la API no necesita exponerse al navegador.

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

El cliente usa estos endpoints relativos al proxy `/api`; este los reenvía como
rutas relativas a `API_URL`:

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
