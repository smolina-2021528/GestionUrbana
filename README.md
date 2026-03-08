# Sistema de Gestión Urbana Inteligente — Backend

API REST para la gestión de reportes ciudadanos con análisis de imágenes por IA, geolocalización con PostGIS y notificaciones en tiempo real.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Docker](#docker)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Roles y permisos](#roles-y-permisos)
- [Autenticación](#autenticación)
- [Documentación de la API (Swagger/OpenAPI)](#documentación-de-la-api-swaggeropenapi)
- [Modelos de datos](#modelos-de-datos)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Stack tecnológico

| Componente       | Tecnología                          |
|------------------|-------------------------------------|
| Runtime          | Node.js 20 + ES Modules             |
| Framework        | Express 5.x                         |
| Base de datos    | PostgreSQL 15 + PostGIS 3.4         |
| ORM              | Sequelize 6                         |
| Hashing          | Argon2id                            |
| Autenticación    | JWT (jsonwebtoken) con blacklist     |
| IA               | Google Gemini 1.5 Flash             |
| Almacenamiento   | Cloudinary (imágenes)               |
| Email            | Nodemailer                          |
| Validación       | express-validator                   |
| Geocodificación  | Nominatim (OpenStreetMap)           |
| Exportación      | ExcelJS (XLSX/CSV)                  |
| Seguridad HTTP   | Helmet + CORS                       |
| Rate limiting    | express-rate-limit                  |
| Contenedores     | Docker + Docker Compose             |

---

## Requisitos previos

- Node.js 20+
- pnpm 9+ (o npm)
- PostgreSQL 15 con extensión PostGIS
- Cuenta en Cloudinary
- API Key de Google Gemini
- Servidor SMTP (Gmail, SendGrid, etc.)

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# ── Servidor ──────────────────────────────────────────────
PORT=3006
NODE_ENV=development

# ── Base de datos ─────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_urbana
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SQL_LOGGING=false

# ── JWT ───────────────────────────────────────────────────
JWT_SECRET=un_secreto_muy_largo_y_seguro
JWT_EXPIRES_IN=24h
JWT_ISSUER=gestion-urbana-api
JWT_AUDIENCE=gestion-urbana-client

# ── Cloudinary ────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=gestion-urbana
CLOUDINARY_FOLDER_REPORTS=gestion-urbana/reports

# ── Gemini ────────────────────────────────────────────────
GEMINI_API_KEY=tu_api_key_de_gemini
GEMINI_AI_ENABLED=true

# ── Email (SMTP) ──────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=false
SMTP_USERNAME=tu_correo@gmail.com
SMTP_PASSWORD=tu_app_password
EMAIL_FROM=tu_correo@gmail.com
EMAIL_FROM_NAME=Gestión Urbana

# ── Frontend ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

---

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/smolina-2021528/GestionUrbana.git
cd GestionUrbana/GestionUrbana-develop

# Instalar dependencias
pnpm install

# Desarrollo (nodemon + alter:true en Sequelize)
pnpm dev

# Producción
pnpm start
```

Al iniciar, el servidor automáticamente:
1. Conecta a PostgreSQL y habilita la extensión PostGIS.
2. Sincroniza los modelos Sequelize (`alter: true` en development).
3. Ejecuta los seeders de roles y usuario administrador por defecto.
4. Crea el índice espacial GIST en `reports.location`.
5. Crea los 6 índices compuestos B-tree para consultas frecuentes.

**Credenciales del administrador por defecto:**
- Email: `admin@gestionurbana.com`
- Contraseña: `Admin1234!`

---

## Docker

```bash
# Levantar PostgreSQL + PostGIS
docker compose up -d

# Ver logs
docker compose logs -f postgres_db
```

El `docker-compose.yml` incluye únicamente el servicio de base de datos. La API se ejecuta localmente o en su propio contenedor independiente.

---

## Arquitectura del proyecto

```
GestionUrbana-develop/
├── index.js                    # Entry point — manejo de errores globales
├── configs/
│   ├── app.js                  # Inicialización del servidor (middlewares + rutas)
│   ├── db.js                   # Conexión Sequelize + graceful shutdown
│   ├── config.js               # Variables de entorno centralizadas
│   ├── gemini-config.js        # Inicialización de Gemini SDK
│   ├── cors-configuration.js   # Opciones CORS
│   └── helmet-configuration.js # Política de seguridad HTTP
├── src/
│   ├── auth/                   # Registro, login, logout, verificación email
│   ├── users/                  # Gestión administrativa de usuarios
│   ├── profiles/               # Perfil propio del usuario autenticado
│   └── reports/
│       ├── report.*            # CRUD principal de reportes
│       ├── ai.*                # Análisis y creación asistida por Gemini
│       ├── duplicate.*         # Detección de duplicados (NLP + geo)
│       ├── comment.*           # Comentarios + follow/unfollow + notificaciones
│       ├── stats.*             # Dashboard, trends, zonas, export, heatmap-grid
│       └── *.model.js          # Modelos Sequelize
├── helpers/
│   ├── token-blacklist.js      # Blacklist JWT en memoria para logout
│   ├── duplicate-service.js    # TF-IDF + cosine similarity + haversine
│   ├── ai-cache.js             # Caché LRU 500 entradas / TTL 1h para Gemini
│   ├── gemini-service.js       # Llamada a Gemini con caché integrado
│   ├── notification-service.js # Notificaciones in-app no bloqueantes
│   ├── cloudinary-service.js   # Upload/delete en Cloudinary
│   ├── nominatim-service.js    # Geocodificación reversa
│   └── ...                     # DB helpers, seeders, constantes
├── middlewares/
│   ├── validate-JWT.js         # Verificación JWT + blacklist check
│   ├── validate-admin.js       # Verificación de rol ADMIN_ROLE
│   ├── validate-report-owner.js
│   ├── validate-report-images.js
│   ├── require-ai-enabled.js
│   ├── request-limit.js        # Rate limiters diferenciados
│   ├── validation.js           # Todos los validadores express-validator
│   └── server-genericError-handler.js
└── utils/                      # Helpers de password, JWT, respuestas
```

---

## Roles y permisos

| Acción                           | USER_ROLE         | ADMIN_ROLE |
|----------------------------------|:-----------------:|:----------:|
| Registrarse / Login / Logout     | ✓                 | ✓          |
| Crear reporte                    | ✓                 | ✓          |
| Ver reporte propio               | ✓                 | ✓          |
| Ver todos los reportes           |                   | ✓          |
| Editar / eliminar reporte propio | ✓ (solo PENDIENTE)| ✓          |
| Cambiar estado de reporte        |                   | ✓          |
| Asignar reporte a personal       |                   | ✓          |
| Comentar (público)               | ✓                 | ✓          |
| Comentar (interno)               |                   | ✓          |
| Seguir / dejar de seguir reporte | ✓                 | ✓          |
| Ver notificaciones propias       | ✓                 | ✓          |
| Reprocesar IA                    |                   | ✓          |
| Estadísticas y analíticas        |                   | ✓          |
| Gestionar usuarios               |                   | ✓          |
| Exportar reportes                |                   | ✓          |
| Verificar / buscar duplicados    | ✓                 | ✓          |

---

## Autenticación

Todos los endpoints protegidos requieren el header:

```
x-token: <JWT>
```

También se acepta `Authorization: Bearer <JWT>`.

El JWT se obtiene en `POST /auth/login` y se invalida con `POST /auth/logout` (blacklist en memoria por `jti`, limpieza automática cada 15 min).

---

## Documentación de la API (Swagger/OpenAPI)

**Base URL:** `http://localhost:3006/gestionurbana/v1`

```yaml
openapi: "3.0.3"
info:
  title: "Sistema de Gestión Urbana Inteligente — API"
  description: |
    API REST para gestión de reportes ciudadanos urbanos.
    Incluye análisis de imágenes con Google Gemini 1.5 Flash,
    geolocalización con PostGIS y detección de duplicados con NLP.
  version: "1.0.0"
  contact:
    name: "Equipo GestionUrbana — Taller III, Fundación Kinal"

servers:
  - url: "http://localhost:3006/gestionurbana/v1"
    description: "Desarrollo local"

tags:
  - name: "Auth"
    description: "Registro, login, logout y verificación de email"
  - name: "Profile"
    description: "Perfil del usuario autenticado"
  - name: "Users"
    description: "Gestión administrativa de usuarios (ADMIN_ROLE)"
  - name: "Reports"
    description: "CRUD de reportes ciudadanos y operaciones geoespaciales"
  - name: "AI"
    description: "Análisis y creación de reportes asistidos por Gemini 1.5 Flash"
  - name: "Duplicates"
    description: "Detección de reportes duplicados mediante NLP y proximidad geográfica"
  - name: "Comments"
    description: "Comentarios en reportes y sistema de seguimiento"
  - name: "Notifications"
    description: "Notificaciones in-app del usuario autenticado"
  - name: "Stats"
    description: "Estadísticas, analíticas y exportación (ADMIN_ROLE)"
  - name: "Health"
    description: "Estado del servidor"

components:
  securitySchemes:
    xToken:
      type: apiKey
      in: header
      name: x-token
      description: "JWT obtenido en POST /auth/login"

  schemas:
    Category:
      type: string
      enum: [INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA]

    Priority:
      type: string
      enum: [ALTA, MEDIA, BAJA]

    ReportStatus:
      type: string
      enum: [PENDIENTE, EN_PROCESO, RESUELTO, RECHAZADO]

    AiStatus:
      type: string
      enum: [PENDING, OK, FAILED]

    NotificationType:
      type: string
      enum: [STATUS_CHANGED, NEW_COMMENT, REPORT_ASSIGNED]

    UserSummary:
      type: object
      properties:
        id:       { type: string, example: "abc123def456" }
        name:     { type: string, example: "Juan" }
        surname:  { type: string, example: "Pérez" }
        username: { type: string, example: "juanperez" }
        email:    { type: string, format: email }

    ReportImage:
      type: object
      properties:
        id:       { type: string }
        imageUrl: { type: string, format: uri }
        order:    { type: integer, minimum: 0 }

    ReportBase:
      type: object
      properties:
        id:            { type: string }
        title:         { type: string }
        description:   { type: string }
        category:      { $ref: "#/components/schemas/Category" }
        priority:      { $ref: "#/components/schemas/Priority" }
        status:        { $ref: "#/components/schemas/ReportStatus" }
        latitude:      { type: number, nullable: true }
        longitude:     { type: number, nullable: true }
        address:       { type: string, nullable: true }
        aiStatus:      { $ref: "#/components/schemas/AiStatus" }
        aiCategory:    { $ref: "#/components/schemas/Category" }
        aiPriority:    { $ref: "#/components/schemas/Priority" }
        aiConfidence:  { type: number, minimum: 0, maximum: 1, nullable: true }
        aiReasoning:   { type: string, nullable: true }
        aiProcessedAt: { type: string, format: date-time, nullable: true }
        createdAt:     { type: string, format: date-time }
        updatedAt:     { type: string, format: date-time }
        resolvedAt:    { type: string, format: date-time, nullable: true }
        images:        { type: array, items: { $ref: "#/components/schemas/ReportImage" } }
        citizen:       { $ref: "#/components/schemas/UserSummary" }

    Notification:
      type: object
      properties:
        id:        { type: string }
        type:      { $ref: "#/components/schemas/NotificationType" }
        message:   { type: string }
        isRead:    { type: boolean }
        createdAt: { type: string, format: date-time }
        report:
          type: object
          properties:
            id:     { type: string }
            title:  { type: string }
            status: { $ref: "#/components/schemas/ReportStatus" }

    PaginationMeta:
      type: object
      properties:
        total:      { type: integer }
        page:       { type: integer }
        limit:      { type: integer }
        totalPages: { type: integer }

    SuccessResponse:
      type: object
      properties:
        success: { type: boolean, example: true }
        message: { type: string }

    ErrorResponse:
      type: object
      properties:
        success:   { type: boolean, example: false }
        message:   { type: string }
        errors:    { type: array, items: { type: object } }
        traceId:   { type: string }
        timestamp: { type: string, format: date-time }

    SimilarityInfo:
      type: object
      properties:
        score:       { type: number, minimum: 0, maximum: 1 }
        isDuplicate: { type: boolean }
        distanceM:   { type: integer, nullable: true }
        label:
          type: string
          enum: ["Duplicado probable", "Muy similar", "Similar"]

paths:

  # ── AUTH ─────────────────────────────────────────────────────────────────────

  /auth/register:
    post:
      tags: [Auth]
      summary: Registrar nuevo ciudadano
      description: |
        La contraseña debe contener al menos una mayúscula, una minúscula y un número.
        Se envía email de verificación. La cuenta queda inactiva hasta verificar.
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [name, surname, username, email, password]
              properties:
                name:           { type: string, maxLength: 25 }
                surname:        { type: string, maxLength: 25 }
                username:       { type: string, maxLength: 50 }
                email:          { type: string, format: email }
                password:       { type: string, minLength: 8, example: "Password1!" }
                phone:          { type: string }
                profilePicture: { type: string, format: binary }
      responses:
        "201": { description: "Usuario registrado. Email de verificación enviado." }
        "400": { description: "Datos inválidos o contraseña débil" }
        "409": { description: "Email o username ya en uso" }
        "429": { description: "Rate limit excedido" }

  /auth/login:
    post:
      tags: [Auth]
      summary: Iniciar sesión
      description: Retorna JWT de 24h. Copiar `token` en variable de entorno de Postman.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [emailOrUsername, password]
              properties:
                emailOrUsername: { type: string }
                password:        { type: string }
      responses:
        "200":
          description: Login exitoso
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      token: { type: string }
                      data:  { $ref: "#/components/schemas/UserSummary" }
        "400": { description: "Credenciales inválidas" }
        "401": { description: "Email no verificado o cuenta desactivada" }

  /auth/logout:
    post:
      tags: [Auth]
      summary: Cerrar sesión
      description: |
        Invalida el JWT actual por jti en la blacklist en memoria.
        El token queda inutilizable de inmediato aunque no haya expirado.
        Limpieza automática de la blacklist cada 15 minutos.
      security:
        - xToken: []
      responses:
        "200": { description: "Sesión cerrada exitosamente" }
        "401": { description: "Token inválido o ya revocado" }

  /auth/verify-email:
    post:
      tags: [Auth]
      summary: Verificar email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token]
              properties:
                token: { type: string }
      responses:
        "200": { description: "Cuenta activada" }
        "400": { description: "Token inválido o expirado" }

  /auth/resend-verification:
    post:
      tags: [Auth]
      summary: Reenviar email de verificación
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email: { type: string, format: email }
      responses:
        "200": { description: "Email enviado si la cuenta existe y no está verificada" }
        "429": { description: "Rate limit de email excedido" }

  /auth/forgot-password:
    post:
      tags: [Auth]
      summary: Solicitar reset de contraseña
      description: En NODE_ENV=development la respuesta incluye debug_token para pruebas.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email: { type: string, format: email }
      responses:
        "200": { description: "Email enviado si la cuenta existe" }

  /auth/reset-password:
    post:
      tags: [Auth]
      summary: Restablecer contraseña
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token, newPassword]
              properties:
                token:       { type: string }
                newPassword: { type: string, minLength: 8, example: "NuevoPassword1!" }
      responses:
        "200": { description: "Contraseña restablecida" }
        "400": { description: "Token inválido/expirado o contraseña débil" }

  /auth/profile:
    get:
      tags: [Auth]
      summary: Obtener perfil propio
      security:
        - xToken: []
      responses:
        "200":
          description: Perfil del usuario autenticado
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data: { $ref: "#/components/schemas/UserSummary" }

  # ── PROFILE ──────────────────────────────────────────────────────────────────

  /profile:
    put:
      tags: [Profile]
      summary: Actualizar perfil propio
      security:
        - xToken: []
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                name:           { type: string }
                surname:        { type: string }
                username:       { type: string }
                phone:          { type: string }
                profilePicture: { type: string, format: binary }
      responses:
        "200": { description: "Perfil actualizado" }
        "409": { description: "Username ya en uso" }

  /profile/change-password:
    put:
      tags: [Profile]
      summary: Cambiar contraseña
      security:
        - xToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [currentPassword, newPassword]
              properties:
                currentPassword: { type: string }
                newPassword:     { type: string, minLength: 8 }
      responses:
        "200": { description: "Contraseña actualizada" }
        "400": { description: "Contraseña actual incorrecta o nueva contraseña débil" }

  # ── USERS ────────────────────────────────────────────────────────────────────

  /users:
    get:
      tags: [Users]
      summary: Listar todos los usuarios (Admin)
      security:
        - xToken: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 20 }
        - in: query
          name: search
          schema: { type: string }
      responses:
        "200": { description: "Lista paginada de usuarios" }
        "403": { description: "No es ADMIN_ROLE" }

  /users/by-role/{roleName}:
    get:
      tags: [Users]
      summary: Listar usuarios por rol
      security:
        - xToken: []
      parameters:
        - in: path
          name: roleName
          required: true
          schema: { type: string, enum: [USER_ROLE, ADMIN_ROLE] }
      responses:
        "200": { description: "Lista de usuarios con el rol indicado" }

  /users/{userId}/roles:
    get:
      tags: [Users]
      summary: Ver roles de un usuario
      security:
        - xToken: []
      parameters:
        - in: path
          name: userId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Roles del usuario" }

  /users/{userId}/role:
    put:
      tags: [Users]
      summary: Cambiar rol de un usuario (Admin)
      security:
        - xToken: []
      parameters:
        - in: path
          name: userId
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [roleName]
              properties:
                roleName: { type: string, enum: [USER_ROLE, ADMIN_ROLE] }
      responses:
        "200": { description: "Rol actualizado" }

  /users/{userId}/status:
    patch:
      tags: [Users]
      summary: Activar o desactivar cuenta (Admin)
      description: Un usuario desactivado recibe HTTP 423 al intentar autenticarse.
      security:
        - xToken: []
      parameters:
        - in: path
          name: userId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Estado alternado" }

  # ── REPORTS ──────────────────────────────────────────────────────────────────

  /reports:
    post:
      tags: [Reports]
      summary: Crear reporte
      description: |
        Si se adjunta imagen pero faltan title/description/category, Gemini los genera
        automáticamente (modo AI-assisted). Máximo 3 imágenes. Las coordenadas
        se geocodifican en reverso con Nominatim.
      security:
        - xToken: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                title:       { type: string, minLength: 3, maxLength: 150 }
                description: { type: string, minLength: 10, maxLength: 2000 }
                category:    { $ref: "#/components/schemas/Category" }
                latitude:    { type: number }
                longitude:   { type: number }
                address:     { type: string }
                images:
                  type: array
                  items: { type: string, format: binary }
                  maxItems: 3
      responses:
        "201":
          description: Reporte creado
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data: { $ref: "#/components/schemas/ReportBase" }
        "400": { description: "Datos inválidos" }

    get:
      tags: [Reports]
      summary: Listar todos los reportes (Admin)
      security:
        - xToken: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10, maximum: 50 }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: priority
          schema: { $ref: "#/components/schemas/Priority" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: sortBy
          schema: { type: string, enum: [date, priority], default: date }
          description: "priority usa orden ALTA→MEDIA→BAJA (ASC)"
        - in: query
          name: sortOrder
          schema: { type: string, enum: [ASC, DESC], default: DESC }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200":
          description: Lista paginada con metadatos de sort
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data: { type: array, items: { $ref: "#/components/schemas/ReportBase" } }
                      meta: { $ref: "#/components/schemas/PaginationMeta" }
                      sort:
                        type: object
                        properties:
                          sortBy:    { type: string }
                          sortOrder: { type: string }
        "403": { description: "No es ADMIN_ROLE" }

  /reports/my-reports:
    get:
      tags: [Reports]
      summary: Mis reportes
      security:
        - xToken: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10 }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200": { description: "Reportes del usuario paginados" }

  /reports/search:
    get:
      tags: [Reports]
      summary: Buscar reportes por texto
      security:
        - xToken: []
      parameters:
        - in: query
          name: q
          required: true
          schema: { type: string, minLength: 3 }
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10 }
      responses:
        "200": { description: "Resultados paginados" }

  /reports/nearby:
    get:
      tags: [Reports]
      summary: Reportes cercanos a un punto
      description: Usa ST_DWithin de PostGIS. Retorna reportes ordenados por distancia ASC.
      security:
        - xToken: []
      parameters:
        - in: query
          name: lat
          required: true
          schema: { type: number }
        - in: query
          name: lng
          required: true
          schema: { type: number }
        - in: query
          name: radius
          schema: { type: integer, minimum: 50, maximum: 50000, default: 1000 }
          description: Radio en metros
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10 }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
      responses:
        "200": { description: "Reportes con campo distanceMeters" }

  /reports/heatmap:
    get:
      tags: [Reports]
      summary: Datos para mapa de calor (puntos)
      security:
        - xToken: []
      parameters:
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: priority
          schema: { $ref: "#/components/schemas/Priority" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200": { description: "Array de puntos {lat, lng, weight, category, priority}" }

  /reports/bbox:
    get:
      tags: [Reports]
      summary: Reportes en área rectangular (Bounding Box)
      security:
        - xToken: []
      parameters:
        - in: query
          name: swLat
          required: true
          schema: { type: number }
        - in: query
          name: swLng
          required: true
          schema: { type: number }
        - in: query
          name: neLat
          required: true
          schema: { type: number }
        - in: query
          name: neLng
          required: true
          schema: { type: number }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
      responses:
        "200": { description: "Reportes dentro del rectángulo SW-NE" }

  /reports/stats:
    get:
      tags: [Reports]
      summary: Estadísticas de reportes (Admin)
      security:
        - xToken: []
      responses:
        "200": { description: "Totales por estado, categoría, prioridad y tasa de resolución" }
        "403": { description: "No es ADMIN_ROLE" }

  /reports/geo-stats:
    get:
      tags: [Reports]
      summary: Estadísticas geográficas (Admin)
      security:
        - xToken: []
      responses:
        "200": { description: "Cobertura geográfica por categoría" }
        "403": { description: "No es ADMIN_ROLE" }

  /reports/followed:
    get:
      tags: [Reports]
      summary: Reportes que sigo
      security:
        - xToken: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10 }
      responses:
        "200": { description: "Reportes a los que el usuario está suscrito" }

  /reports/{reportId}:
    get:
      tags: [Reports]
      summary: Obtener reporte por ID
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Reporte completo
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data: { $ref: "#/components/schemas/ReportBase" }
        "404": { description: "No encontrado" }

    put:
      tags: [Reports]
      summary: Actualizar reporte
      description: Solo en estado PENDIENTE. Solo el dueño.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                title:       { type: string }
                description: { type: string }
                category:    { $ref: "#/components/schemas/Category" }
                latitude:    { type: number }
                longitude:   { type: number }
                address:     { type: string }
                images:
                  type: array
                  items: { type: string, format: binary }
      responses:
        "200": { description: "Reporte actualizado" }
        "403": { description: "Sin permiso" }

    delete:
      tags: [Reports]
      summary: Eliminar reporte
      description: Dueño solo en PENDIENTE. Admin en cualquier estado. Elimina imágenes de Cloudinary.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Reporte eliminado" }
        "403": { description: "Sin permiso" }

  /reports/{reportId}/status:
    patch:
      tags: [Reports]
      summary: Cambiar estado del reporte (Admin)
      description: |
        Transiciones válidas:
        PENDIENTE → EN_PROCESO | RECHAZADO
        EN_PROCESO → RESUELTO | RECHAZADO | PENDIENTE
        RECHAZADO → PENDIENTE
        Se notifica al dueño y seguidores.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status: { $ref: "#/components/schemas/ReportStatus" }
                notes:  { type: string }
      responses:
        "200": { description: "Estado actualizado" }
        "400": { description: "Transición no permitida" }
        "403": { description: "No es ADMIN_ROLE" }

  /reports/{reportId}/assign:
    patch:
      tags: [Reports]
      summary: Asignar reporte a personal municipal (Admin)
      description: El asignado y el dueño reciben notificación in-app.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [assignedTo]
              properties:
                assignedTo: { type: string }
      responses:
        "200": { description: "Reporte asignado" }
        "403": { description: "No es ADMIN_ROLE" }

  /reports/{reportId}/location:
    patch:
      tags: [Reports]
      summary: Actualizar ubicación del reporte
      description: Solo en estado PENDIENTE. Solo el dueño.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [latitude, longitude]
              properties:
                latitude:  { type: number, minimum: -90,  maximum: 90 }
                longitude: { type: number, minimum: -180, maximum: 180 }
                address:   { type: string }
      responses:
        "200": { description: "Ubicación actualizada" }

    delete:
      tags: [Reports]
      summary: Eliminar ubicación del reporte
      description: Borra lat, lng, geometry y address. Solo en PENDIENTE.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Ubicación eliminada" }

  /reports/{reportId}/images/{imageId}:
    delete:
      tags: [Reports]
      summary: Eliminar imagen de un reporte
      description: Borra del reporte y de Cloudinary.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
        - in: path
          name: imageId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Imagen eliminada" }
        "403": { description: "No es el dueño" }

  /reports/{reportId}/history:
    get:
      tags: [Reports]
      summary: Historial de cambios de estado
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Historial cronológico
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          type: object
                          properties:
                            previousStatus: { $ref: "#/components/schemas/ReportStatus" }
                            newStatus:      { $ref: "#/components/schemas/ReportStatus" }
                            notes:          { type: string, nullable: true }
                            changedBy:      { $ref: "#/components/schemas/UserSummary" }
                            createdAt:      { type: string, format: date-time }

  /reports/{reportId}/ai/reprocess:
    post:
      tags: [Reports]
      summary: Reprocesar reporte con IA (Admin)
      description: |
        Re-analiza la primera imagen con Gemini 1.5 Flash de forma síncrona.
        Invalida el caché de la imagen para forzar análisis fresco.
        Actualiza Category, Priority y todos los campos AI*.
        Requiere GEMINI_AI_ENABLED=true y al menos una imagen.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Reporte reprocesado" }
        "403": { description: "No es ADMIN_ROLE" }
        "404": { description: "Reporte no encontrado" }
        "422":
          description: "Sin imágenes o Gemini falló"
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/ErrorResponse"
                  - type: object
                    properties:
                      stage: { type: string, enum: [no-images, gemini] }
        "503": { description: "IA deshabilitada (GEMINI_AI_ENABLED=false)" }

  # ── AI ───────────────────────────────────────────────────────────────────────

  /reports/analyze:
    post:
      tags: [AI]
      summary: Analizar imagen con Gemini
      description: Retorna categoría, prioridad, título y descripción sugeridos. Cachea resultado 1h.
      security:
        - xToken: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [image]
              properties:
                image:       { type: string, format: binary }
                description: { type: string }
      responses:
        "200":
          description: Resultado del análisis
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          title:       { type: string }
                          description: { type: string }
                          category:    { $ref: "#/components/schemas/Category" }
                          priority:    { $ref: "#/components/schemas/Priority" }
        "503": { description: "IA deshabilitada" }

  /reports/ai-create:
    post:
      tags: [AI]
      summary: Crear reporte asistido por IA
      description: Crea un reporte completo usando solo una imagen. Gemini genera todos los campos de texto.
      security:
        - xToken: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [image]
              properties:
                image:     { type: string, format: binary }
                latitude:  { type: number }
                longitude: { type: number }
                address:   { type: string }
      responses:
        "201": { description: "Reporte creado con datos generados por IA" }
        "503": { description: "IA deshabilitada" }

  # ── DUPLICATES ───────────────────────────────────────────────────────────────

  /reports/check-duplicates:
    post:
      tags: [Duplicates]
      summary: Verificar duplicados antes de crear un reporte
      description: |
        Score combinado sin dependencias externas:
        | Factor                         | Peso |
        |-------------------------------|------|
        | TF-IDF + cosine (título+desc)  | 60%  |
        | Misma categoría               | 25%  |
        | Proximidad < 100m (haversine) | 15%  |

        score >= 0.45 → Similar. score >= 0.75 → Duplicado probable.
      security:
        - xToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, description, category]
              properties:
                title:       { type: string, minLength: 3, maxLength: 150 }
                description: { type: string, minLength: 10, maxLength: 2000 }
                category:    { $ref: "#/components/schemas/Category" }
                latitude:    { type: number }
                longitude:   { type: number }
      parameters:
        - in: query
          name: limit
          schema: { type: integer, minimum: 1, maximum: 10, default: 3 }
        - in: query
          name: threshold
          schema: { type: number, minimum: 0, maximum: 1, default: 0.45 }
      responses:
        "200":
          description: Resultado de verificación
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          hasDuplicates: { type: boolean }
                          message:       { type: string }
                          candidates:
                            type: array
                            items:
                              allOf:
                                - $ref: "#/components/schemas/ReportBase"
                                - type: object
                                  properties:
                                    similarity: { $ref: "#/components/schemas/SimilarityInfo" }

  /reports/{reportId}/similar:
    get:
      tags: [Duplicates]
      summary: Reportes similares a uno existente
      description: Mismo algoritmo que check-duplicates pero sobre un reporte ya guardado.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
        - in: query
          name: limit
          schema: { type: integer, minimum: 1, maximum: 20, default: 5 }
        - in: query
          name: threshold
          schema: { type: number, minimum: 0, maximum: 1, default: 0.45 }
      responses:
        "200":
          description: Reportes similares ordenados por score DESC
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          baseReport:
                            type: object
                            properties:
                              id:       { type: string }
                              title:    { type: string }
                              category: { $ref: "#/components/schemas/Category" }
                          similar:
                            type: array
                            items:
                              allOf:
                                - $ref: "#/components/schemas/ReportBase"
                                - type: object
                                  properties:
                                    similarity: { $ref: "#/components/schemas/SimilarityInfo" }
                      meta:
                        type: object
                        properties:
                          total:              { type: integer }
                          threshold:          { type: number }
                          duplicateThreshold: { type: number }
        "404": { description: "Reporte base no encontrado" }

  # ── COMMENTS & FOLLOW ────────────────────────────────────────────────────────

  /reports/{reportId}/comments:
    post:
      tags: [Comments]
      summary: Crear comentario en un reporte
      description: isInternal=true solo para ADMIN_ROLE. Los comentarios públicos generan notificación al dueño.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content:    { type: string, minLength: 1, maxLength: 1000 }
                isInternal: { type: boolean, default: false }
      responses:
        "201": { description: "Comentario creado" }
        "403": { description: "isInternal=true pero no es ADMIN_ROLE" }

    get:
      tags: [Comments]
      summary: Listar comentarios de un reporte
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 10 }
        - in: query
          name: includeInternal
          schema: { type: boolean, default: false }
      responses:
        "200": { description: "Lista paginada de comentarios" }

  /reports/{reportId}/comments/{commentId}:
    delete:
      tags: [Comments]
      summary: Eliminar un comentario
      description: Solo el autor o ADMIN_ROLE.
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
        - in: path
          name: commentId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Comentario eliminado" }
        "403": { description: "No es el autor ni ADMIN_ROLE" }

  /reports/{reportId}/follow:
    post:
      tags: [Comments]
      summary: Seguir un reporte
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Siguiendo el reporte" }
        "409": { description: "Ya está siguiendo" }

    delete:
      tags: [Comments]
      summary: Dejar de seguir un reporte
      security:
        - xToken: []
      parameters:
        - in: path
          name: reportId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Dejó de seguir" }
        "404": { description: "No estaba siguiendo" }

  # ── NOTIFICATIONS ────────────────────────────────────────────────────────────

  /notifications:
    get:
      tags: [Notifications]
      summary: Mis notificaciones
      security:
        - xToken: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 20 }
        - in: query
          name: onlyUnread
          schema: { type: boolean, default: false }
      responses:
        "200":
          description: Lista paginada de notificaciones
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data: { type: array, items: { $ref: "#/components/schemas/Notification" } }
                      meta:
                        allOf:
                          - $ref: "#/components/schemas/PaginationMeta"
                          - type: object
                            properties:
                              unreadCount: { type: integer }

  /notifications/read-all:
    patch:
      tags: [Notifications]
      summary: Marcar todas las notificaciones como leídas
      security:
        - xToken: []
      responses:
        "200": { description: "Todas marcadas como leídas" }

  /notifications/{notificationId}/read:
    patch:
      tags: [Notifications]
      summary: Marcar una notificación como leída
      security:
        - xToken: []
      parameters:
        - in: path
          name: notificationId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Notificación marcada como leída" }
        "404": { description: "No encontrada" }

  /notifications/{notificationId}:
    delete:
      tags: [Notifications]
      summary: Eliminar una notificación
      security:
        - xToken: []
      parameters:
        - in: path
          name: notificationId
          required: true
          schema: { type: string }
      responses:
        "200": { description: "Notificación eliminada" }
        "404": { description: "No encontrada" }

  # ── STATS ────────────────────────────────────────────────────────────────────

  /stats/dashboard:
    get:
      tags: [Stats]
      summary: Dashboard con métricas agregadas (Admin)
      description: Totales por estado/categoría/prioridad, tasa de resolución, tiempo promedio y cobertura geo.
      security:
        - xToken: []
      parameters:
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: priority
          schema: { $ref: "#/components/schemas/Priority" }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200": { description: "Métricas del dashboard" }
        "403": { description: "No es ADMIN_ROLE" }

  /stats/trends:
    get:
      tags: [Stats]
      summary: Tendencias temporales (Admin)
      security:
        - xToken: []
      parameters:
        - in: query
          name: groupBy
          schema: { type: string, enum: [day, week, month], default: day }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200": { description: "Serie temporal agrupada por day/week/month" }

  /stats/zones:
    get:
      tags: [Stats]
      summary: Ranking de zonas con más reportes (Admin)
      description: Usa ST_ClusterDBSCAN para agrupar reportes cercanos en zonas.
      security:
        - xToken: []
      parameters:
        - in: query
          name: radius
          schema: { type: integer, default: 1000 }
        - in: query
          name: limit
          schema: { type: integer, minimum: 1, maximum: 20, default: 10 }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
      responses:
        "200": { description: "Zonas ordenadas por concentración" }

  /stats/export:
    get:
      tags: [Stats]
      summary: Exportar reportes en XLSX o CSV (Admin)
      description: Header X-Export-Truncated indica si se alcanzó el límite máximo.
      security:
        - xToken: []
      parameters:
        - in: query
          name: format
          required: true
          schema: { type: string, enum: [xlsx, csv] }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: priority
          schema: { $ref: "#/components/schemas/Priority" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200":
          description: Archivo descargable
          headers:
            Content-Disposition:
              schema: { type: string }
            X-Export-Truncated:
              schema: { type: boolean }
          content:
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
              schema: { type: string, format: binary }
            text/csv:
              schema: { type: string }

  /stats/transitions:
    get:
      tags: [Stats]
      summary: Estadísticas de transiciones de estado (Admin)
      security:
        - xToken: []
      parameters:
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200": { description: "Conteo de transiciones entre estados" }

  /stats/heatmap-grid:
    get:
      tags: [Stats]
      summary: Mapa de calor por grilla (Admin)
      description: |
        Agrupa reportes en grilla regular con ST_SnapToGrid.
        cellDegrees 0.009° ≈ 1km en Guatemala (recomendado).
      security:
        - xToken: []
      parameters:
        - in: query
          name: cellDegrees
          schema: { type: number, minimum: 0.001, maximum: 0.1, default: 0.009 }
        - in: query
          name: category
          schema: { $ref: "#/components/schemas/Category" }
        - in: query
          name: priority
          schema: { $ref: "#/components/schemas/Priority" }
        - in: query
          name: status
          schema: { $ref: "#/components/schemas/ReportStatus" }
        - in: query
          name: startDate
          schema: { type: string, format: date-time }
        - in: query
          name: endDate
          schema: { type: string, format: date-time }
      responses:
        "200":
          description: Celdas de la grilla con conteo
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/SuccessResponse"
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          type: object
                          properties:
                            lat:   { type: number }
                            lng:   { type: number }
                            count: { type: integer }

  # ── HEALTH ───────────────────────────────────────────────────────────────────

  /health:
    get:
      tags: [Health]
      summary: Estado del servidor
      description: No requiere autenticación.
      responses:
        "200":
          description: Servidor activo
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:    { type: string, example: "Healthy" }
                  timestamp: { type: string, format: date-time }
                  service:   { type: string }
                  version:   { type: string }
                  env:       { type: string }
```

---

## Modelos de datos

### Tabla `reports`

| Campo            | Tipo              | Descripción                                      |
|------------------|-------------------|--------------------------------------------------|
| id               | VARCHAR(16)       | PK — ID generado con nanoid                      |
| title            | VARCHAR(150)      | Título del reporte                               |
| description      | TEXT              | Descripción detallada                            |
| category         | VARCHAR(50)       | INFRAESTRUCTURA \| SEGURIDAD \| LIMPIEZA          |
| priority         | VARCHAR(20)       | ALTA \| MEDIA \| BAJA                             |
| status           | VARCHAR(20)       | PENDIENTE \| EN_PROCESO \| RESUELTO \| RECHAZADO  |
| user_id          | VARCHAR(16)       | FK → users                                       |
| assigned_to      | VARCHAR(16)       | FK → users (nullable)                            |
| resolved_at      | TIMESTAMPTZ       | Fecha de resolución (nullable)                   |
| latitude         | DECIMAL(10,8)     | Latitud (nullable)                               |
| longitude        | DECIMAL(11,8)     | Longitud (nullable)                              |
| location         | GEOMETRY(POINT)   | PostGIS — índice GIST                            |
| address          | VARCHAR(500)      | Dirección textual (nullable)                     |
| ai_status        | VARCHAR(10)       | PENDING \| OK \| FAILED (nullable)                |
| ai_category      | VARCHAR(50)       | Categoría detectada por IA (nullable)            |
| ai_priority      | VARCHAR(20)       | Prioridad detectada por IA (nullable)            |
| ai_confidence    | FLOAT             | Confianza del análisis 0–1 (nullable)            |
| ai_reasoning     | VARCHAR(500)      | Razonamiento del modelo (nullable)               |
| ai_processed_at  | TIMESTAMPTZ       | Timestamp del análisis IA (nullable)             |
| ai_raw           | TEXT              | Respuesta raw de Gemini (nullable)               |
| created_at       | TIMESTAMPTZ       |                                                  |
| updated_at       | TIMESTAMPTZ       |                                                  |

### Índices de base de datos

| Nombre                        | Columnas                    | Tipo   | Propósito                          |
|-------------------------------|-----------------------------|--------|------------------------------------|
| reports_location_gist_idx     | location                    | GIST   | Consultas geoespaciales PostGIS    |
| reports_category_status_idx   | category, status            | B-tree | Filtros combinados del dashboard   |
| reports_priority_created_idx  | priority, created_at DESC   | B-tree | Listado priorizado con paginación  |
| reports_status_created_idx    | status, created_at DESC     | B-tree | Filtro por estado ordenado         |
| reports_user_created_idx      | user_id, created_at DESC    | B-tree | Mis reportes paginados             |
| reports_assigned_idx          | assigned_to WHERE NOT NULL  | B-tree | Reportes asignados a personal      |
| reports_ai_status_idx         | ai_status WHERE NOT NULL    | B-tree | Reportes pendientes de análisis IA |

---

## Decisiones técnicas

**Migración MongoDB → PostgreSQL**
El proyecto comenzó con un stack MERN. Durante el Sprint 2 se migró a PostgreSQL por los requerimientos de geolocalización avanzada (PostGIS), integridad referencial entre reportes/usuarios/comentarios y la necesidad de queries analíticas complejas (GROUP BY, JOINs, window functions).

**Blacklist JWT en memoria**
El logout invalida tokens usando un `Map` indexado por `jti`. La limpieza automática cada 15 minutos evita crecimiento indefinido. Para escalado horizontal se reemplazaría con Redis (`SET jti EX <ttl>`).

**Caché LRU para Gemini**
Las llamadas a Gemini son costosas. El caché LRU de 500 entradas con TTL de 1 hora evita re-analizar la misma imagen. Al hacer `reprocess`, el caché se invalida explícitamente para garantizar análisis fresco.

**Detección de duplicados sin dependencias externas**
El módulo `duplicate-service.js` implementa TF-IDF + cosine similarity en JavaScript puro. Score combinado: texto (60%), categoría (25%), proximidad geográfica (15%). La distancia usa la fórmula de Haversine en memoria, sin round-trip a PostgreSQL.

**Notificaciones no bloqueantes**
Las notificaciones in-app se generan con `setImmediate()`. Si fallan, se loguea el error pero la operación principal no se ve afectada.

**Rate limiting diferenciado**
- General: 20 req/min por IP
- Auth (login, register, reset): 5 req/min por IP
- Email (forgot-password, resend): 3 req/15min por IP