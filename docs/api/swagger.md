# Swagger / OpenAPI

La API cuenta con documentación automática generada con Swagger.

- **Ruta local:** `http://localhost:3000/api/docs`
- **Archivo:** `swagger.json`
- **Dependencia:** `@nestjs/swagger`

## Cómo actualizar

1. Agregar decoradores `@ApiProperty()`, `@ApiTags()`, `@ApiResponse()` en los controladores.
2. Ejecutar el proyecto → Swagger se actualiza automáticamente.
3. Exportar el archivo si se requiere compartir (`docs/api/swagger.json`).

## Objetivo

Facilitar pruebas, debugging y validación del contrato con frontend.
