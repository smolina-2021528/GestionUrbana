# Ciudad Activa / Gestión Urbana

Aplicación web para gestión urbana ciudadana y operativa.

El sistema permite que ciudadanos reporten problemas urbanos con imagen y ubicación, y que administradores revisen, clasifiquen, asignen, gestionen y den seguimiento a esos reportes.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación local](#instalación-local)
- [Ejecución local](#ejecución-local)
- [Servicios y puertos](#servicios-y-puertos)
- [Scripts disponibles](#scripts-disponibles)
- [Flujos principales](#flujos-principales)
- [Roles y permisos](#roles-y-permisos)
- [Endpoints principales](#endpoints-principales)
- [Inteligencia artificial](#inteligencia-artificial)
- [Imágenes y Cloudinary](#imágenes-y-cloudinary)
- [Ubicación y PostGIS](#ubicación-y-postgis)
- [Verificación y pruebas manuales](#verificación-y-pruebas-manuales)
- [Problemas comunes](#problemas-comunes)
- [Preparación para despliegue](#preparación-para-despliegue)
- [Plan posterior de app móvil](#plan-posterior-de-app-móvil)
- [Notas técnicas importantes](#notas-técnicas-importantes)

---

## Descripción general

Ciudad Activa / Gestión Urbana es un sistema web orientado a reportes ciudadanos y gestión operativa municipal.

Permite a un ciudadano:

- Registrarse.
- Verificar su correo.
- Iniciar sesión.
- Crear reportes urbanos.
- Adjuntar imágenes.
- Registrar ubicación mediante coordenadas o dirección.
- Usar apoyo de inteligencia artificial para sugerir datos del reporte.
- Revisar posibles duplicados antes de enviar.
- Consultar sus reportes.
- Ver detalle, historial, comentarios y seguimiento.

Permite a un administrador:

- Consultar todos los reportes.
- Filtrar por estado, prioridad, categoría, fechas y búsqueda.
- Revisar el detalle completo de cada reporte.
- Ver ubicación en mapa.
- Revisar análisis de IA.
- Reprocesar IA cuando corresponda.
- Consultar reportes similares.
- Asignar responsables.
- Cambiar estados operativos.
- Agregar comentarios.
- Revisar historial.
- Gestionar usuarios.
- Cambiar roles.
- Activar y desactivar cuentas.
- Consultar dashboard y métricas operativas.

---

## Stack tecnológico

### Frontend

| Área | Tecnología |
|---|---|
| Framework | React |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Ruteo | React Router |
| Estado servidor | TanStack React Query |
| HTTP | Axios |
| Formularios | React Hook Form |
| Validación | Zod |
| Mapas | Leaflet / React Leaflet |
| Estilos | CSS modular por página o componente |

### Backend

| Área | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Lenguaje | JavaScript ES Modules |
| Base de datos | PostgreSQL + PostGIS |
| ORM | Sequelize |
| Autenticación | JWT |
| Hash de contraseñas | Argon2 |
| Subida de archivos | Multer |
| Imágenes | Cloudinary |
| IA | Google Gemini |
| Geocodificación | Nominatim / OpenStreetMap |
| Email | Nodemailer |
| Exportación | ExcelJS |
| Seguridad HTTP | Helmet, CORS, rate limit |

### Infraestructura local

| Componente | Tecnología |
|---|---|
| Base de datos local | Docker Compose |
| Imagen DB | postgis/postgis:16-3.4 |
| Puerto DB local | 5436 |
| Puerto DB interno | 5432 |

---

## Arquitectura del proyecto

Estructura principal esperada:

```text
GestionUrbana-main/
├── backend/
│   ├── auth-service/
│   ├── report-service/
│   └── shared/
├── frontend/
├── uploads/
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── .env.example
└── README.md
```

### `backend/auth-service`

Responsable de:

- Registro.
- Login.
- Verificación de correo.
- Recuperación de contraseña.
- Perfil autenticado.
- Roles.
- Usuarios.
- Activación y desactivación de cuentas.
- Cambio de rol.
- Logout local del servicio.

### `backend/report-service`

Responsable de:

- Reportes.
- Imágenes.
- Ubicación.
- Comentarios.
- Historial.
- Seguimiento.
- Notificaciones.
- Asignación de responsables.
- Cambio de estado.
- IA.
- Duplicados.
- Reportes similares.
- Dashboard.
- Métricas.
- Exportación.

### `backend/shared`

Código compartido entre servicios, por ejemplo:

- Subida de archivos.
- Cloudinary.
- Utilidades comunes.

### `frontend`

Cliente web de Ciudad Activa.

Contiene módulos para:

- Autenticación.
- Reportes ciudadanos.
- Reportes administrativos.
- Dashboard.
- Usuarios.
- Layout.
- Servicios HTTP compartidos.
- Componentes reutilizables.

---

## Requisitos previos

Instalar previamente:

- Node.js 20 o superior.
- pnpm.
- Docker Desktop.
- Cuenta de Cloudinary.
- API Key de Gemini si se usará IA.
- Servicio SMTP si se probará correo real.

Verifica versiones:

```bash
node -v
pnpm -v
docker --version
docker compose version
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto.

Puedes iniciar copiando:

```bash
cp .env.example .env
```

Contenido recomendado para desarrollo:

```env
# ─────────────────────────────────────────────────────────────
# Entorno general
# ─────────────────────────────────────────────────────────────
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ─────────────────────────────────────────────────────────────
# Puertos de servicios
# ─────────────────────────────────────────────────────────────
AUTH_PORT=3006
REPORT_PORT=3007

# ─────────────────────────────────────────────────────────────
# Base de datos PostgreSQL/PostGIS
# Docker publica 5436 en tu computadora y 5432 dentro del contenedor.
# Como los servicios Node corren fuera de Docker, usa DB_PORT=5436.
# ─────────────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5436
DB_NAME=gestion_urbana
DB_USER=postgres
DB_PASSWORD=postgres
DB_SQL_LOGGING=false

# ─────────────────────────────────────────────────────────────
# JWT
# Cambia JWT_SECRET por un valor fuerte antes de producción.
# ─────────────────────────────────────────────────────────────
JWT_SECRET=change_me_use_a_strong_secret
JWT_EXPIRES_IN=8h
JWT_ISSUER=gestion-urbana-api
JWT_AUDIENCE=gestion-urbana-web

# ─────────────────────────────────────────────────────────────
# Administrador inicial
# ─────────────────────────────────────────────────────────────
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@gestionurbana.local
ADMIN_PASSWORD=Admin12345*

# ─────────────────────────────────────────────────────────────
# SMTP / correo
# ─────────────────────────────────────────────────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_ENABLE_SSL=false
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=no-reply@gestionurbana.local
EMAIL_FROM_NAME=Gestion Urbana

# ─────────────────────────────────────────────────────────────
# Cloudinary
# ─────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=gestion-urbana/profiles
CLOUDINARY_FOLDER_REPORTS=gestion-urbana/reports
UPLOAD_PATH=./uploads

# ─────────────────────────────────────────────────────────────
# IA / Gemini
# Si AI_ENABLED=false, report-service debe iniciar aunque GEMINI_API_KEY esté vacía.
# ─────────────────────────────────────────────────────────────
AI_ENABLED=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# ─────────────────────────────────────────────────────────────
# Nominatim
# ─────────────────────────────────────────────────────────────
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=CiudadActiva/1.0
NOMINATIM_TIMEOUT_MS=8000
```

### Variables del frontend

Crear un archivo `frontend/.env`:

```env
VITE_AUTH_API_URL=http://localhost:3006/gestionurbana/v1
VITE_REPORT_API_URL=http://localhost:3007/gestionurbana/v1
```

---

## Instalación local

Desde la raíz del proyecto:

```bash
pnpm install
```

Luego instala dependencias del frontend:

```bash
cd frontend
pnpm install
cd ..
```

> Nota: actualmente el proyecto no usa `pnpm-workspace.yaml`, por lo que la instalación de la raíz y la del frontend se realizan por separado.

---

## Ejecución local

### 1. Levantar PostgreSQL/PostGIS

Desde la raíz:

```bash
docker compose up -d postgres_db
```

Verifica que el contenedor esté activo:

```bash
docker compose ps
```

### 2. Ejecutar Auth Service

Desde la raíz:

```bash
pnpm dev:auth
```

Auth Service corre en:

```text
http://localhost:3006/gestionurbana/v1
```

### 3. Ejecutar Report Service

En otra terminal, desde la raíz:

```bash
pnpm dev:report
```

Report Service corre en:

```text
http://localhost:3007/gestionurbana/v1
```

### 4. Ejecutar Frontend

En otra terminal:

```bash
cd frontend
pnpm dev
```

Frontend corre en:

```text
http://localhost:5173
```

---

## Servicios y puertos

| Servicio | Puerto local | URL base |
|---|---:|---|
| Frontend | 5173 | `http://localhost:5173` |
| Auth Service | 3006 | `http://localhost:3006/gestionurbana/v1` |
| Report Service | 3007 | `http://localhost:3007/gestionurbana/v1` |
| PostgreSQL/PostGIS | 5436 | `localhost:5436` |

---

## Scripts disponibles

### Raíz del proyecto

```bash
pnpm dev
```

Levanta Auth Service y Report Service al mismo tiempo.

```bash
pnpm dev:auth
```

Levanta únicamente Auth Service.

```bash
pnpm dev:report
```

Levanta únicamente Report Service.

```bash
pnpm start
```

Ejecuta ambos servicios con Node.

```bash
pnpm run check:backend
```

Verifica sintaxis de archivos JavaScript del backend.

```bash
pnpm run verify:backend
```

Alias de verificación backend.

```bash
pnpm run lint
```

Actualmente ejecuta verificación de sintaxis backend mientras no exista configuración formal de ESLint.

### Frontend

Dentro de `frontend`:

```bash
pnpm dev
```

Levanta Vite.

```bash
pnpm run typecheck
```

Ejecuta TypeScript.

```bash
pnpm run build
```

Compila TypeScript y genera build con Vite.

```bash
pnpm run verify
```

Ejecuta typecheck y build.

```bash
pnpm run preview
```

Sirve el build localmente para revisión.

---

## Flujos principales

### Flujo ciudadano

1. Registrar cuenta.
2. Verificar correo.
3. Iniciar sesión.
4. Crear reporte.
5. Adjuntar imagen.
6. Indicar ubicación.
7. Usar IA si está disponible.
8. Revisar posibles duplicados.
9. Enviar reporte.
10. Consultar Mis reportes.
11. Abrir detalle del reporte.
12. Revisar comentarios, seguimiento e historial.

### Flujo administrador

1. Iniciar sesión como administrador.
2. Ver dashboard.
3. Consultar todos los reportes.
4. Filtrar por estado, categoría, prioridad o fecha.
5. Abrir detalle de reporte.
6. Revisar ubicación.
7. Revisar IA y similares.
8. Asignar responsable.
9. Cambiar estado.
10. Agregar comentarios.
11. Consultar historial.
12. Gestionar usuarios.
13. Cambiar roles.
14. Activar o desactivar cuentas.

---

## Roles y permisos

Roles principales:

```text
USER_ROLE
ADMIN_ROLE
```

### `USER_ROLE`

Puede:

- Crear reportes.
- Ver sus propios reportes.
- Ver detalle de sus reportes.
- Comentar o dar seguimiento cuando aplique.
- Actualizar su perfil.

No debe poder:

- Acceder a gestión de usuarios.
- Ver reportes ajenos.
- Consultar endpoints administrativos.
- Cambiar estados operativos.
- Asignar responsables.

### `ADMIN_ROLE`

Puede:

- Ver todos los reportes.
- Acceder al dashboard.
- Gestionar reportes.
- Asignar responsables.
- Cambiar estados.
- Gestionar usuarios.
- Cambiar roles.
- Activar y desactivar cuentas.

Protecciones importantes:

- El backend debe ser siempre la autoridad final.
- El frontend oculta acciones no permitidas, pero no reemplaza las validaciones del backend.
- El sistema debe impedir desactivar la propia cuenta de administrador.
- El sistema debe proteger contra dejar el sistema sin administradores.

---

## Endpoints principales

### Auth

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/verify-email
POST /auth/resend-verification
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/profile
```

### Users

```http
GET    /users
GET    /users/by-role/:roleName
GET    /users/:userId/roles
PUT    /users/:userId/role
PATCH  /users/:userId/status
```

Estas rutas deben requerir:

```text
JWT + ADMIN_ROLE
```

### Reports

```http
GET    /reports
GET    /reports/my-reports
GET    /reports/:reportId
POST   /reports
PUT    /reports/:reportId
DELETE /reports/:reportId
PATCH  /reports/:reportId/status
PATCH  /reports/:reportId/assign
PATCH  /reports/:reportId/location
DELETE /reports/:reportId/location
DELETE /reports/:reportId/images/:imageId
GET    /reports/:reportId/history
```

### IA y duplicados

```http
POST /reports/analyze
POST /reports/ai-create
POST /reports/check-duplicates
GET  /reports/:reportId/similar
POST /reports/:reportId/ai/reprocess
```

### Dashboard / analítica

```http
GET /reports/stats
GET /reports/geo-stats
GET /reports/search
GET /reports/nearby
GET /reports/heatmap
GET /reports/bbox
```

---

## Inteligencia artificial

El proyecto usa Gemini para:

- Analizar imágenes.
- Sugerir título.
- Sugerir descripción.
- Sugerir categoría.
- Sugerir prioridad.
- Crear reportes asistidos.
- Revisar duplicados o similares.
- Reprocesar análisis desde administración.

### Configuración

Para desarrollo sin IA:

```env
AI_ENABLED=false
GEMINI_API_KEY=
```

En este modo, `report-service` debe iniciar normalmente y las rutas de IA responderán con servicio no disponible.

Para activar IA:

```env
AI_ENABLED=true
GEMINI_API_KEY=tu_llave_real
GEMINI_MODEL=gemini-1.5-flash
```

### Nota importante

No uses solamente:

```env
GEMINI_AI_ENABLED=true
```

La bandera utilizada por el sistema es:

```env
AI_ENABLED=true
```

---

## Imágenes y Cloudinary

El sistema usa Cloudinary para almacenar:

- Fotos de perfil.
- Imágenes de reportes.

Variables necesarias:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=gestion-urbana/profiles
CLOUDINARY_FOLDER_REPORTS=gestion-urbana/reports
UPLOAD_PATH=./uploads
```

Las imágenes se suben temporalmente a `uploads/` antes de enviarse a Cloudinary.

Buenas prácticas aplicadas:

- `uploads/` no debe versionarse.
- Los temporales deben eliminarse después de subir.
- Si falla una validación, deben limpiarse los archivos temporales.
- Si falla la base de datos después de subir imágenes, deben eliminarse las imágenes compensatorias de Cloudinary.

---

## Ubicación y PostGIS

El proyecto usa PostgreSQL con PostGIS para datos geoespaciales.

Docker publica PostgreSQL así:

```text
5436:5432
```

Por eso, desde los servicios Node que corren fuera de Docker, la configuración correcta es:

```env
DB_HOST=localhost
DB_PORT=5436
```

### Nominatim

Para geocodificación se usa Nominatim.

Variables:

```env
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=CiudadActiva/1.0
NOMINATIM_TIMEOUT_MS=8000
```

Si Nominatim falla o tarda demasiado, el sistema no debe bloquear completamente la creación del reporte.

---

## Verificación y pruebas manuales

### Verificación backend

Desde la raíz:

```bash
pnpm run check:backend
```

### Verificación frontend

Desde `frontend`:

```bash
pnpm run typecheck
pnpm run build
```

o:

```bash
pnpm run verify
```

### Prueba funcional ciudadana

1. Crear cuenta.
2. Verificar correo.
3. Iniciar sesión.
4. Crear reporte con imagen.
5. Agregar ubicación.
6. Ejecutar análisis IA si está habilitada.
7. Revisar duplicados.
8. Enviar reporte.
9. Abrir Mis reportes.
10. Abrir detalle.
11. Revisar comentarios, seguimiento e historial.

### Prueba funcional administrativa

1. Iniciar sesión como administrador.
2. Abrir dashboard.
3. Abrir listado de reportes.
4. Filtrar reportes.
5. Abrir detalle.
6. Revisar ubicación.
7. Asignar responsable.
8. Cambiar estado.
9. Confirmar historial.
10. Gestionar usuarios.
11. Cambiar rol de usuario.
12. Desactivar y activar cuenta.
13. Confirmar que un usuario ciudadano no pueda acceder a rutas administrativas.

### Prueba de permisos

Como `USER_ROLE`, validar que no se pueda acceder a:

```http
GET /users
GET /reports
GET /reports/search
GET /reports/nearby
GET /reports/heatmap
GET /reports/bbox
```

Como `USER_ROLE`, validar que no se pueda abrir por URL directa un reporte ajeno.

### Prueba de cuenta desactivada

1. Iniciar sesión con un usuario.
2. Desde admin, desactivar ese usuario.
3. Usar la sesión abierta del usuario.
4. La siguiente petición protegida debe responder `423`.
5. El frontend debe cerrar la sesión local y enviar al login.

---

## Problemas comunes

### El backend no conecta a PostgreSQL

Verifica:

```bash
docker compose ps
```

Confirma en `.env`:

```env
DB_HOST=localhost
DB_PORT=5436
DB_NAME=gestion_urbana
DB_USER=postgres
DB_PASSWORD=postgres
```

### El frontend no conecta con backend

Revisa `frontend/.env`:

```env
VITE_AUTH_API_URL=http://localhost:3006/gestionurbana/v1
VITE_REPORT_API_URL=http://localhost:3007/gestionurbana/v1
```

Reinicia Vite después de cambiar variables.

### Error de CORS

Verifica en `.env`:

```env
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

También confirma que CORS permita:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Report Service no inicia por Gemini

Para desarrollo sin IA:

```env
AI_ENABLED=false
GEMINI_API_KEY=
```

Si deseas usar IA:

```env
AI_ENABLED=true
GEMINI_API_KEY=tu_llave_real
```

### Las imágenes no suben

Verifica Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

También confirma que `uploads/` exista o pueda crearse automáticamente.

### El frontend compila pero no muestra datos

Confirma que los tres servicios estén levantados:

```text
Frontend       http://localhost:5173
Auth Service   http://localhost:3006/gestionurbana/v1
Report Service http://localhost:3007/gestionurbana/v1
```