# Base de datos

## Diagrama ER

Archivo: `docs/database/ERD.svg`

## Entidades principales

- **Users**
- **Providers**
- **Appointments**
- **Services**
- **Subscriptions**

## Relaciones

- 1 usuario → N citas
- 1 proveedor → N servicios
- 1 servicio → N categorías

## Migraciones

Ejecutar:

```bash
npm run migration:generate
npm run migration:run
```
