# 🧼 CleenGo – Backend (API REST con NestJS)

> Proyecto final Henry Bootcamp – Backend del sistema CleenGo.
> Este servicio gestiona usuarios, proveedores, citas y pagos.

---

## 🚀 Tecnologías principales

- [NestJS](https://nestjs.com/) – Framework backend en Node.js
- [TypeORM](https://typeorm.io/) – ORM para PostgreSQL
- [PostgreSQL](https://www.postgresql.org/) – Base de datos relacional
- [Auth0 / JWT](https://auth0.com/) – Autenticación y autorización
- [Stripe](https://stripe.com/) – Pasarela de pagos
- [Nodemailer](https://nodemailer.com/) – Envío de correos automáticos
- [Swagger](https://swagger.io/) – Documentación de la API

---

## ⚙️ Requisitos previos

- Node.js v20+
- PostgreSQL configurado localmente o en la nube
- Variables de entorno configuradas (`.env.development` o `.env.production`)

---

## 🔧 Instalación y configuración

```bash
# Clonar el repositorio
git clone https://github.com/<equipo>/CleenGo-Back.git
cd CleenGo-Back

# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env.development

# Ejecutar el servidor en modo desarrollo
npm run start:dev
```
