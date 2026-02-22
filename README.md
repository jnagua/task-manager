# TaskFlow — Sistema de Gestión de Tareas

Sistema de gestión de tareas internas desarrollado como prueba técnica Fullstack Developer.

🌐 **Frontend:** https://thriving-sprinkles-2e6186.netlify.app/login
🚀 **Backend:** https://task-manager-production-1abb.up.railway.app/

---

## 1. Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + TypeScript | 18 / 5.x |
| Bundler | Vite | 5.x |
| Estilos | Tailwind CSS | v3 |
| Backend | NestJS + Node.js + TypeScript | 10.x / 18.x |
| ORM | TypeORM | 0.3.x |
| Base de datos | SQLite 3 | 5.x |
| Autenticación | JWT (passport-jwt) | — |
| Encriptación | bcryptjs | 2.x |
| HTTP Client | axios | 1.x |
| Deploy Backend | Railway | — |
| Deploy Frontend | Netlify | — |

**Librerías adicionales:**
- `react-router-dom v6` — enrutamiento SPA
- `react-hot-toast` — notificaciones de feedback
- `class-validator` — validación automática de DTOs en NestJS
- `date-fns` — manejo de fechas en el frontend

---

## 2. Descripción General de la Solución

### Arquitectura

La aplicación sigue una arquitectura cliente-servidor desacoplada. El frontend y el backend son proyectos independientes que se comunican a través de una API REST con autenticación JWT.
```
frontend/          # React SPA (Netlify)
└── src/
    ├── pages/     # LoginPage, TasksPage
    ├── components/# TaskCard, TaskFormModal, Badges
    ├── services/  # axios API layer
    └── hooks/     # useAuth (Context)

backend/           # NestJS REST API (Railway)
└── src/
    ├── auth/      # Login, JWT strategy, Guard
    ├── users/     # User entity + Service
    ├── tasks/     # Task CRUD + filtros
    └── database/  # TypeORM config (SQLite)
```

### Backend — NestJS

Organizado en módulos donde cada dominio tiene tres capas:

- **Controller** — recibe el request HTTP y delega al Service
- **Service** — contiene la lógica de negocio y consultas a BD
- **Entity** — define el modelo de datos con TypeORM

La autenticación usa JWT con `passport-jwt`. El usuario hace login, el backend valida las credenciales con bcrypt, genera un token JWT y lo devuelve. En cada request siguiente, un Guard de NestJS valida el token automáticamente antes de llegar al Controller.

### Frontend — React SPA

SPA que consume la API REST. La comunicación se centraliza en un servicio axios con interceptores que:
- Añaden el token JWT automáticamente en cada request
- Manejan globalmente los errores 401 (sesión expirada → logout automático)

El estado de autenticación se gestiona con React Context, persiste en `localStorage` y está disponible en cualquier componente.

### Base de Datos

SQLite 3 con TypeORM (`synchronize: true`). Tablas principales:

- **users** — email, nombre, contraseña hasheada con bcrypt
- **tasks** — título, descripción, estado, prioridad, fecha de vencimiento y `owner_id` (FK a users)

Relación `ManyToOne`: un usuario puede tener muchas tareas, cada tarea pertenece a un usuario.

### Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- JWT con expiración de 7 días firmado con clave secreta via variable de entorno
- CORS configurado para aceptar solo el dominio del frontend
- Cada usuario solo puede ver, editar y eliminar sus propias tareas (validación por `owner_id`)
- Validación automática de inputs con `class-validator` en los DTOs

---

## 3. Cómo Funciona la Aplicación

### Inicio de sesión
El usuario accede a la pantalla de login, ingresa email y contraseña. Al autenticarse correctamente es redirigido al dashboard. Si las credenciales son incorrectas se muestra un error sin recargar la página.

### Dashboard de tareas
Panel personal con tres contadores en tiempo real (pendientes, en progreso, completadas) y una barra de filtros para ver todas las tareas o filtrar por estado con un solo click.

### Gestión de tareas
Cada tarea se muestra como una tarjeta con estado con código de color, prioridad e indicador visual si está vencida.

- **Crear** — botón *New Task* abre un modal con formulario completo
- **Editar** — ícono de editar abre el modal pre-llenado con los datos actuales
- **Eliminar** — ícono de eliminar pide confirmación y borra la tarea
- **Filtrar** — los tabs actualizan la lista consultando la API al instante

Todas las acciones muestran notificaciones de feedback (toast).

### Cierre de sesión
El botón *Sign out* limpia la sesión y redirige al login. Si el JWT expira durante la sesión, el sistema detecta el 401 automáticamente y cierra la sesión sin intervención del usuario.

---

## 4. Credenciales de Prueba

{ email: 'admin@taskmanager.com', password: 'Admin1234!', name: 'Admin User' },
{ email: 'juan@taskmanager.com', password: 'Juan1234!', name: 'Jaun Perez' },
{ email: 'Maria@taskmanager.com', password: 'Maria1234!', name: 'Maria
Martinez' },

---

## 5. API Endpoints

### Auth
```
POST /login
Body: { "email": "...", "password": "..." }
Response: { "access_token": "...", "user": { id, email, name } }
```

### Tasks (requieren Bearer token)
```
GET    /tasks?status=pending   # Listar (filtro opcional)
POST   /tasks                  # Crear tarea
PUT    /tasks/:id              # Actualizar tarea
DELETE /tasks/:id              # Eliminar tarea
```
