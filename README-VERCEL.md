# Invitación de boda — despliegue en Vercel

## Arquitectura

- Next.js/React sirve el frontend.
- Las rutas `/api/config` y `/api/rsvp` son el backend Node.js.
- PostgreSQL almacena la configuración y las confirmaciones.
- Docker se utiliza únicamente para PostgreSQL en desarrollo local.

## Desarrollo local

```bash
docker compose up -d
copy .env.example .env.local
npm install
npm run dev
```

La invitación estará en `http://localhost:3000` y el panel privado en `http://localhost:3000/admin`.

## Base de producción

Crea una base PostgreSQL administrada y ejecuta `database/init.sql`. Puedes usar Supabase, Neon u otro proveedor compatible. Copia su cadena de conexión completa.

## Variables de Vercel

- `DATABASE_URL`: cadena de conexión PostgreSQL.
- `ADMIN_PIN`: NIP privado para el panel de los novios.

Importa el repositorio en Vercel. El framework y el comando `npm run build` se detectan automáticamente.

## Invitaciones individuales

Desde `/admin`, los novios indican el nombre, los pases y un código. Después pueden copiar el enlace o descargar un PDF personalizado. La invitación pública no muestra estas herramientas.
