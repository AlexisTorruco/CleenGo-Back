# Endpoints principales

## Autenticación

- **POST /auth/login** → Inicia sesión con credenciales.
- **POST /auth/register** → Registra cliente o proveedor.

## Usuarios

- **GET /users/:id** → Retorna información del usuario.
- **PATCH /users/:id** → Actualiza datos del usuario.

## Citas (Appointments)

- **POST /appointments** → Crea una nueva cita.
- **GET /appointments/:id** → Detalle de cita.
- **DELETE /appointments/:id** → Cancela una cita.

> **Roles:** `client`, `provider`, `admin` > **Auth:** Bearer Token (JWT)
