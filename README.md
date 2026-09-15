# ⚙️ API Loro - Backend Documentation

Documentación técnica y de referencia para la API RESTful de **Proyecto Loro**, construida con **Node.js**, **Express**, **TypeScript**, **PostgreSQL** y **Supabase Auth**.

---

## 📋 Índice
1. [Tecnologías y Librerías](#1-tecnologías-y-librerías)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Base de Datos y Modelo ER](#4-base-de-datos-y-modelo-er)
5. [Seguridad y Middlewares](#5-seguridad-y-middlewares)
6. [Referencia Completa de Endpoints](#6-referencia-completa-de-endpoints)
   - [Autenticación (`/api/login`)](#auth-apilogin)
   - [Usuarios (`/api/user`)](#usuarios-apiuser)
   - [Empleados (`/api/employee`)](#empleados-apiemployee)
   - [Departamentos (`/api/department`)](#departamentos-apidepartment)
   - [Roles de Trabajo (`/api/role`)](#roles-de-trabajo-apirole)
   - [Categorías (`/api/category`)](#categorías-apicategory)
   - [Equipos / Dispositivos (`/api/device`)](#equipos--dispositivos-apidevice)
   - [Asignaciones (`/api/assignment`)](#asignaciones-apiassignment)
7. [Instalación y Despliegue](#7-instalación-y-despliegue)

---

## 1. Tecnologías y Librerías

- **Entorno de Ejecución**: Node.js (v18+)
- **Lenguaje**: TypeScript (`v6.0.3`)
- **Framework Web**: Express (`v5.2.1`)
- **Base de Datos**: PostgreSQL (`pg v8.22.0`)
- **Servicio de Autenticación**: `@supabase/supabase-js` (`v2.112.3`)
- **Seguridad**:
  - `helmet`: Cabeceras HTTP seguras
  - `cors`: Configuración CORS origen cruzado
  - `express-rate-limit`: Prevención de ataques por fuerza bruta (limitador a 10 intentos en 15 min en `/api/login`)
  - `express-validator`: Validaciones de esquemas de entrada

---

## 2. Estructura del Proyecto

```
api-loro/
├── src/
│   ├── config/
│   │   ├── db.ts               # Pool de conexiones a PostgreSQL
│   │   ├── initDb.ts           # Inicialización e inserción automática de tablas base (historial_bajas)
│   │   └── supabaseClient.ts   # Cliente de Supabase Admin Auth
│   ├── controllers/
│   │   ├── assignment.controller.ts
│   │   ├── category.controller.ts
│   │   ├── department.controller.ts
│   │   ├── device.controller.ts
│   │   ├── employee.controller.ts
│   │   ├── login.controller.ts
│   │   ├── role.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/
│   │   ├── assignment.middleware.ts
│   │   ├── auth.middleware.ts
│   │   ├── category.middleware.ts
│   │   ├── department.middleware.ts
│   │   ├── device.middleware.ts
│   │   ├── employee.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── login.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── user.middleware.ts
│   ├── routes/
│   │   ├── assignment.route.ts
│   │   ├── category.route.ts
│   │   ├── department.route.ts
│   │   ├── device.route.ts
│   │   ├── employee.route.ts
│   │   ├── role.route.ts
│   │   └── user.route.ts
│   ├── utils/
│   │   ├── AppError.util.ts
│   │   ├── asyncHandler.util.ts
│   │   ├── toTItleCase.util.ts
│   │   └── validator.util.ts
│   └── index.ts                 # Servidor de entrada Express
├── tsconfig.json
├── package.json
└── .env
```

---

## 3. Variables de Entorno

Crea un archivo `.env` en la raíz de `api-loro` con los siguientes parámetros:

```env
PORT=3000
FRONTEND_URL=http://localhost:3001

# Conexión Base de Datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_password
DB_NAME=nombre_bd
DB_PORT=5432
NODE_ENV=development

# Credenciales Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SECRET_KEY=tu_supabase_secret_key
```

---

## 4. Base de Datos y Modelo ER

### Tablas Principales

1. **`public.usuario`**
   - `id`: `UUID / VARCHAR` (Coincide con Supabase Auth User ID)
   - `nombre`: `VARCHAR`
   - `email`: `VARCHAR`
   - `rol`: `VARCHAR` (ej: `Admin`, `User`)
   - `activo`: `BOOLEAN DEFAULT true`

2. **`public.departamento`**
   - `id`: `SERIAL PRIMARY KEY`
   - `nombre`: `VARCHAR NOT NULL`
   - `activo`: `BOOLEAN DEFAULT true`

3. **`public.rol`**
   - `id`: `SERIAL PRIMARY KEY`
   - `nombre`: `VARCHAR NOT NULL`
   - `departamento_id`: `INT REFERENCES departamento(id)`
   - `activo`: `BOOLEAN DEFAULT true`

4. **`public.empleado`**
   - `id`: `SERIAL PRIMARY KEY`
   - `ci`: `VARCHAR NOT NULL UNIQUE`
   - `nombre`: `VARCHAR NOT NULL`
   - `rol_id`: `INT REFERENCES rol(id)`
   - `activo`: `BOOLEAN DEFAULT true`

5. **`public.categoria`**
   - `id`: `SERIAL PRIMARY KEY`
   - `nombre`: `VARCHAR NOT NULL`
   - `activo`: `BOOLEAN DEFAULT true`

6. **`public.equipo`**
   - `id`: `SERIAL PRIMARY KEY`
   - `codigo_inventario`: `VARCHAR NOT NULL UNIQUE`
   - `nombre`: `VARCHAR`
   - `categoria_id`: `INT REFERENCES categoria(id)`
   - `departamento_id`: `INT REFERENCES departamento(id)`
   - `estado`: `VARCHAR DEFAULT 'Disponible'` (`Disponible`, `Asignado`)
   - `ram`: `VARCHAR`
   - `rom`: `VARCHAR`
   - `modelo`: `VARCHAR`
   - `numero_telefono`: `VARCHAR`
   - `imei`: `VARCHAR`
   - `observaciones`: `TEXT`
   - `activo`: `BOOLEAN DEFAULT true`

7. **`public.asignacion`**
   - `id`: `SERIAL PRIMARY KEY`
   - `equipo_id`: `INT REFERENCES equipo(id)`
   - `empleado_id`: `INT REFERENCES empleado(id)`
   - `fecha_inicio`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
   - `fecha_fin`: `TIMESTAMP NULL`
   - `activo`: `BOOLEAN DEFAULT true`

8. **`public.historial_bajas`**
   - `id`: `SERIAL PRIMARY KEY`
   - `entidad`: `VARCHAR(50) NOT NULL` (`empleado`, `equipo`, `asignacion`)
   - `entidad_id`: `INT NOT NULL`
   - `motivo`: `TEXT NOT NULL`
   - `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

---

## 5. Seguridad y Middlewares

- **`authMiddleware`**: Extrae el token `Bearer <token>` del header `Authorization`. Verifica con `supabase.auth.getUser(token)`. Si la cuenta no existe localmente en `public.usuario`, la crea automáticamente sincronizando metadata. Adiciona `req.user` al objeto de petición.
- **`requireRole(roles)`**: Middleware de autorización basado en roles. Permite restringir acciones a roles específicos (ej. `['Admin']`).
- **`loginLimiter`**: Bloquea IPs que superen 10 intentos en `/api/login` por 15 minutos.
- **`validator.util.ts`**: Ejecuta `validationResult(req)` de express-validator y responde con código HTTP 400 en caso de fallos de formato.

---

## 6. Referencia Completa de Endpoints

### Auth (`/api/login`)

#### `POST /api/login`
Inicia sesión de usuario con Supabase Auth y devuelve token JWT junto al perfil.
- **Limitador**: Max 10 peticiones / 15 min.
- **Body**:
  ```json
  {
    "email": "admin@ejemplo.com",
    "password": "Password123!"
  }
  ```
- **Respuesta (200 OK)**:
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOi...",
    "data": {
      "id": "uuid-1234",
      "email": "admin@ejemplo.com",
      "nombre": "Administrador",
      "rol": "Admin",
      "activo": true
    }
  }
  ```

---

### Usuarios (`/api/user`)
*Todas las rutas requieren cabecera `Authorization: Bearer <token>`.*

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/` | Registrar nuevo usuario en Supabase Auth y PostgreSQL | Autenticado |
| `GET` | `/api/user/` | Listar usuarios con paginación, búsqueda y filtro de estado | Autenticado |
| `GET` | `/api/user/:id` | Obtener un usuario por ID | Autenticado |
| `PUT` | `/api/user/:id` | Actualizar nombre y rol del usuario | Autenticado |
| `PATCH` | `/api/user/:id/password` | Cambiar contraseña del usuario | Autenticado |
| `DELETE`| `/api/user/:id` | Desactivar usuario (`activo = false`) | Autenticado |
| `PATCH` | `/api/user/:id/restore` | Reactivar usuario (`activo = true`) | Autenticado |

**Parámetros Query en GET**:
- `page`: Número de página (default `1`)
- `limit`: Cantidad por página (default `10`)
- `search`: Texto de búsqueda (filtra por nombre o email)
- `activo`: `"true"` o `"false"`

---

### Empleados (`/api/employee`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/employee/` | Registrar nuevo empleado (`ci`, `nombre`, `rol_id`) |
| `GET` | `/api/employee/` | Obtener empleados paginados con JOIN a roles y departamentos |
| `GET` | `/api/employee/:ci` | Buscar un empleado por Cédula de Identidad (`ci`) |
| `PUT` | `/api/employee/:id` | Actualizar datos del empleado |
| `DELETE`| `/api/employee/:id` | Dar de baja lógica a un empleado (acepta `motivo` en body para historial) |
| `PATCH` | `/api/employee/:id/restore` | Restaurar empleado inactivo |
| `GET` | `/api/employee/:id/history` | Obtener el historial de bajas/desactivaciones del empleado |

---

### Departamentos (`/api/department`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/department/` | Crear departamento (`nombre`) |
| `GET` | `/api/department/` | Listar departamentos paginados |
| `GET` | `/api/department/:nombre` | Buscar departamento por nombre |
| `PUT` | `/api/department/:id` | Modificar nombre del departamento |
| `DELETE`| `/api/department/:id` | Desactivar departamento |
| `PATCH` | `/api/department/:id/restore` | Reactivar departamento |

---

### Roles de Trabajo (`/api/role`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/role/` | Crear rol (`nombre`, `departamento_id`) |
| `GET` | `/api/role/` | Listar roles con datos del departamento asociado |
| `GET` | `/api/role/:nombre` | Buscar un rol por nombre |
| `PUT` | `/api/role/:id` | Actualizar nombre o departamento del rol |
| `DELETE`| `/api/role/:id` | Desactivar rol |
| `PATCH` | `/api/role/:id/restore` | Reactivar rol |

---

### Categorías (`/api/category`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/category/` | Crear categoría de equipos (`nombre`) |
| `GET` | `/api/category/` | Listar categorías paginadas |
| `POST` | `/api/category/search` | Buscar categoría por nombre |
| `PUT` | `/api/category/:id` | Actualizar nombre |
| `DELETE`| `/api/category/:id` | Desactivar categoría |
| `PATCH` | `/api/category/:id/restore` | Reactivar categoría |

---

### Equipos / Dispositivos (`/api/device`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/device/` | Registrar equipo (`codigo_inventario`, `nombre`, `categoria_id`, `departamento_id`, etc.) |
| `GET` | `/api/device/` | Listar equipos con filtros por `categoria_id`, `departamento_id`, `search`, `activo` |
| `PUT` | `/api/device/:id` | Actualizar especificaciones o asignaciones del equipo |
| `DELETE`| `/api/device/:id` | Desactivar equipo (Bloqueado si `estado === 'Asignado'`) |
| `PATCH` | `/api/device/:id/restore` | Restaurar equipo inactivo |
| `GET` | `/api/device/:id/history` | Obtener historial de motivos de baja del equipo |

---

### Asignaciones (`/api/assignment`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/assignment/` | Asignar un equipo a un empleado. Actualiza automáticamente `estado = 'Asignado'` en `equipo`. |
| `GET` | `/api/assignment/` | Listar asignaciones activas/inactivas con JOIN a equipo, empleado y departamento |
| `DELETE`| `/api/assignment/:id` | Finalizar asignación (`fecha_fin = NOW()`), libera el equipo a estado `Disponible`. |
| `GET` | `/api/assignment/:id/history` | Consultar motivos de finalización o baja de la asignación |

---

## 7. Instalación y Despliegue

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
# Compilar TypeScript a JavaScript
npm run build

# Iniciar servidor compilado
npm start
```
