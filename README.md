# 🧼 CleenGo – Backend API

Backend del proyecto **CleenGo**, desarrollado como proyecto final del **Henry Bootcamp**.  
Plataforma full stack para la contratación y gestión de servicios (limpieza, jardinería, etc.).

> 📌 **Rol:** Backend Developer  
> 📌 **Enfoque:** APIs REST, autenticación, pagos, automatización y arquitectura backend

---

## 🚀 Stack tecnológico

- **NestJS** – Framework backend (Node.js)
- **TypeORM** – ORM
- **PostgreSQL** – Base de datos
- **Supabase** – Auth, Storage y DB
- **Redis** – Cache / tareas programadas
- **Stripe** – Pagos y suscripciones
- **Nodemailer + SendGrid** – Emails transaccionales
- **JWT** – Autenticación
- **Cron Jobs** – Tareas programadas
- **Swagger** – Documentación de API
- **CORS** – Seguridad

---

## 🔑 Funcionalidades principales

- Autenticación de usuarios y proveedores
- Roles (cliente / proveedor / admin)
- Gestión de citas y disponibilidad
- Pagos y suscripciones con Stripe
- Envío de correos automáticos
- Almacenamiento de archivos (Supabase Storage)
- Tareas programadas (cron)
- Arquitectura modular y escalable

---

## ⚙️ Instalación y ejecución local

### Requisitos
- Node.js v20+
- PostgreSQL
- Variables de entorno configuradas

### Pasos

```bash
git clone https://github.com/AlexisTorruco/CleenGo-Back.git
cd CleenGo-Back
npm install
cp .env.example .env.development
npm run start:dev
```

## El servidor corre por defecto en:
http://localhost:3000

## 📚 Documentación API
http://localhost:3000/api

### 👤 Autor
Alexis Torruco

Backend Developer | NestJS | TypeORM | PostgreSQL

Proyecto realizado durante Henry Bootcamp

