# Sistema de Gestión de Empleados y Solicitudes THINK-US

Proyecto FullStack desarrollado con React, Node.js y PostgreSQL que permite gestionar empleados y sus solicitudes, con autenticación JWT y autorización basada en roles.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Endpoints de la API](#endpoints-de-la-api)
- [Ejecución con Docker](#ejecución-con-docker)
- [Pruebas](#pruebas)
- [Mejores Prácticas](#mejores-prácticas)
- [Seguridad](#seguridad)

## Características

- **Autenticación JWT** con roles diferenciados (Empleado y Administrador)
- **CRUD completo** para Empleados y Solicitudes
- **Autorización basada en roles** para operaciones sensibles
- **Pruebas unitarias** con Jest
- **Dockerización** completa de la aplicación
- **Base de datos PostgreSQL** con Sequelize ORM
- **Frontend con React**
- **Backend con NodeJs Puro**

## Tecnologías

- **Node.js** (v18+)
- **PostgreSQL** (v16)
- **Sequelize** (ORM)
- **JWT** (jsonwebtoken)
- **Jest** (Testing)
- **Docker & Docker Compose**

## Requisitos

### Docker

- Docker
- Docker Compose

## Instalación

### Opción 1: Con Docker

Docker Compose creará automáticamente la base de datos PostgreSQL y hara los despliegues del backend y frontend.

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd think-us-backend
```

2. **Modificar el archivo `.env.example` a `.env` y sustituir con valores reales**

```env
# Base de datos
DB_NAME=tu-base-de-datos
DB_USER=tu-usuario
DB_PASSWORD=tu-contrasena

# JWT
JWT_SECRET=tu-json-web-token
JWT_EXPIRES_IN=duracion

# Servidor
PORT=8888
```

3. **Levantar la aplicación con Docker**

```bash
docker-compose up --build
```

Este comando:

- Crea el contenedor de PostgreSQL
- Crea el contenedor de la API
- Crea el contenedor del frontend
- Expone la API en `http://localhost:8888`
- Expone la API en `http://localhost:3000`
- Expone PostgreSQL en `localhost:5432`

**Usuarios creados con la base de datos:**

- `empleado@example.com` / `123Password` (rol: empleado)
- `administrador@example.com` / `123Password` (rol: administrador)

5. **Verificar que funciona**

```bash
curl http://localhost:4000/health
```

## Configuración

### Variables de Entorno

| Variable         | Descripción                    | Ejemplo                     |
| ---------------- | ------------------------------ | --------------------------- |
| `DB_NAME`        | Nombre de la base de datos     | `think_us_db`               |
| `DB_USER`        | Usuario de PostgreSQL          | `think_us_user`             |
| `DB_PASSWORD`    | Contraseña de PostgreSQL       | `your_password`             |
| `DB_HOST`        | Host de la base de datos       | `localhost` o `db` (Docker) |
| `JWT_SECRET`     | Clave secreta para JWT         | (string largo y aleatorio)  |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h`, `7d`, etc.           |
| `PORT`           | Puerto del servidor            | `8888`                      |

## Backend Testing

```bash
# Ejecutar pruebas en el backend
cd backend
npm test
```

## Endpoints de la API

### Autenticación (Público)

#### Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta:**

```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "roles": ["empleado"]
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "empleado@example.com",
  "password": "Passw0rd123"
}
```

**Respuesta:**

```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Empleado",
    "lastName": "Demo",
    "email": "empleado@example.com",
    "roles": ["empleado"]
  }
}
```

### Empleados (Requiere Autenticación)

#### Listar Empleados

```http
GET /api/employees?page=1&limit=10&search=Juan
Authorization: Bearer <token>
```

**Parámetros de consulta:**

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda por nombre, email o posición

**Respuesta:**

```json
{
  "data": [
    {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez",
      "position": "Desarrollador",
      "salary": "50000.00",
      "email": "juan@example.com",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Obtener Empleado por ID

```http
GET /api/employees/:id
Authorization: Bearer <token>
```

#### Crear Empleado

```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Ana",
  "lastName": "García",
  "position": "Diseñadora",
  "salary": 45000,
  "email": "ana@example.com"
}
```

#### Actualizar Empleado (Solo Administrador)

```http
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": "Senior Developer",
  "salary": 60000
}
```

#### Eliminar Empleado (Solo Administrador)

```http
DELETE /api/employees/:id
Authorization: Bearer <token>
```

### Solicitudes (Requiere Autenticación)

#### Listar Solicitudes

```http
GET /api/solicitudes?page=1&limit=10&status=pendiente&search=proyecto
Authorization: Bearer <token>
```

**Parámetros de consulta:**

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `status`: Filtrar por estado (pendiente, cancelada, completada)
- `search`: Búsqueda por título o descripción

#### Crear Solicitud

```http
POST /api/solicitudes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Solicitud de vacaciones",
  "description": "Solicito 5 días de vacaciones",
  "employeeId": 1
}
```

#### Actualizar Solicitud (Solo Administrador)

```http
PUT /api/solicitudes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completada"
}
```

#### Eliminar Solicitud (Solo Administrador)

```http
DELETE /api/solicitudes/:id
Authorization: Bearer <token>
```

## Ejecución con Docker

### Comandos Docker Disponibles

```bash
# Iniciar la aplicación
npm run docker:local

# Detener y eliminar contenedores
npm run docker:down

# Reconstruir completamente
npm run docker:rebuild
```

### Acceso a la Base de Datos

```bash
# Conectarse a PostgreSQL dentro del contenedor
docker exec -it think-us-db psql -U think_us_user -d think_us_db

# Ver logs de la API
docker logs -f think-us-api

# Ver logs de la base de datos
docker logs -f think-us-db
```

## Pruebas

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas con cobertura
npm test

# Ejecutar en modo watch
npm run test:watch
```

## Mejores Prácticas

### Arquitectura y Organización

1. **Separación de Responsabilidades**

   - **Modelos**: Definen la estructura de datos y validaciones
   - **Controladores**: Manejan la lógica de negocio
   - **Middleware**: Gestiona autenticación y autorización
   - **Utils**: Funciones reutilizables (JWT, validaciones)

2. **Async/Await**

   - Todo el código asincrónico usa `async/await` para mejor legibilidad y manejo de errores

3. **ORM (Sequelize)**

   - Uso de ORM en lugar de SQL directo para:
     - Prevenir SQL Injection
     - Mantener código portable entre bases de datos
     - Facilitar migraciones y cambios de esquema

4. **Variables de Entorno**

   - Configuración sensible (credenciales, secrets) en archivo `.env`
   - Nunca se hace commit del `.env` (incluido en `.gitignore`)

5. **Paginación**

   - Todas las listas implementan paginación para evitar sobrecarga del servidor
   - Parámetros `page` y `limit` configurables

6. **Filtrado y Búsqueda**

   - Endpoints de listado permiten filtrar y buscar datos
   - Uso de operadores de Sequelize (`Op.iLike`, `Op.or`)

7. **Manejo de Errores**

   - Try-catch en todos los controladores
   - Respuestas HTTP con códigos de estado apropiados
   - Mensajes de error descriptivos pero sin exponer detalles sensibles

8. **Testing**
   - Pruebas unitarias con Jest
   - Base de datos SQLite en memoria para tests (no afecta desarrollo)
   - Coverage mínimo del 85%

### Convenciones de Código

- **Nombres descriptivos**: Variables y funciones con nombres claros
- **Comentarios mínimos**: Código autoexplicativo
- **Consistencia**: Mismo estilo en todo el proyecto
- **No generadores**: Todo el código escrito manualmente

## Seguridad

### 1. Autenticación y Autorización

**JWT (JSON Web Tokens)**

- Tokens firmados con secret de 64+ caracteres
- Expiración configurable (default: 24h)
- Payload mínimo (solo id y email, no datos sensibles)

**Roles Diferenciados**

- `empleado`: Solo puede consultar y crear
- `administrador`: Permisos completos (CRUD)

**Middleware de Autorización**

```javascript
// Verifica que el usuario esté autenticado
await authenticate(req);

// Verifica que el usuario tenga el rol necesario
await authorize(ROLES.ADMINISTRADOR)(req);
```

### 2. Protección contra SQL Injection

**Uso de ORM (Sequelize)**

- Todas las consultas son parametrizadas automáticamente
- Sequelize escapa caracteres especiales
- No se concatenan strings en queries

### 3. Protección contra XSS (Cross-Site Scripting)

**Sanitización de Entradas**

- Uso de la librería `validator` para limpiar inputs
- `validator.escape()` elimina caracteres HTML peligrosos
- `validator.normalizeEmail()` estandariza emails

**Ejemplo:**

```javascript
const sanitizedData = {
  firstName: validator.escape(firstName.trim()),
  email: validator.normalizeEmail(email),
};
```

### 4. Hashing de Contraseñas

**bcrypt**

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Nunca se almacenan contraseñas en texto plano
- Hash automático mediante hooks de Sequelize

```javascript
// Hook beforeCreate
beforeCreate: async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
};
```

### 5. Validaciones

**A nivel de Modelo**

- Validación de formato de email
- Longitud mínima de contraseña (8 caracteres)
- Campos requeridos y tipos de datos
- Valores únicos (email)

**A nivel de Controlador**

- Verificación de datos requeridos
- Validación de formato de email con `validator.isEmail()`
- Validación de existencia de registros relacionados

### 6. CORS (Cross-Origin Resource Sharing)

**Headers Configurados**

```javascript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
```

**Nota:** En producción, reemplazar `*` por el dominio específico del frontend.

## Estructura del Proyecto

```
think-us-backend/
├── database/
│   └── init.sql                 # Script SQL de inicialización
├── src/
│   ├── config/
│   │   └── test-setup.js        # Configuración para tests
│   ├── constants/
│   │   └── roles.js             # Definición de roles
│   ├── controllers/
│   │   ├── __tests__/
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   └── solicitud.controller.js
│   ├── database/
│   │   ├── db.js                # Conexión a base de datos
│   │   ├── migrations/
│   │   │   └── index.js
│   │   └── seed/
│   │       └── index.js         # Datos iniciales
│   ├── middleware/
│   │   ├── __tests__/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── __tests__/
│   │   ├── index.js             # Exporta todos los modelos
│   │   ├── employee.model.js
│   │   ├── role.model.js
│   │   ├── solicitud.model.js
│   │   ├── user.model.js
│   │   └── userRole.model.js
│   └── utils/
│       ├── __tests__/
│       ├── jwt.js
│       └── routes.js
├── .env                         # Variables de entorno (no en git)
├── .env.test                    # Variables para testing (no en git)
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
└── server.js                    # Punto de entrada

```

## Roles y Permisos

| Endpoint               | Método | Empleado   | Administrador |
| ---------------------- | ------ | ---------- | ------------- |
| `/api/auth/register`   | POST   | ✅ Público | ✅ Público    |
| `/api/auth/login`      | POST   | ✅ Público | ✅ Público    |
| `/api/employees`       | GET    | ✅         | ✅            |
| `/api/employees`       | POST   | ✅         | ✅            |
| `/api/employees/:id`   | GET    | ✅         | ✅            |
| `/api/employees/:id`   | PUT    | ❌         | ✅            |
| `/api/employees/:id`   | DELETE | ❌         | ✅            |
| `/api/solicitudes`     | GET    | ✅         | ✅            |
| `/api/solicitudes`     | POST   | ✅         | ✅            |
| `/api/solicitudes/:id` | GET    | ✅         | ✅            |
| `/api/solicitudes/:id` | PUT    | ❌         | ✅            |
| `/api/solicitudes/:id` | DELETE | ❌         | ✅            |
