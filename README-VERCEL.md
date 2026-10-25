# Invitación de boda — despliegue en Vercel

## 1. Base de datos gratuita

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Project Settings > API**, copia la URL del proyecto y la clave `service_role`.

## 2. Variables de entorno

Copia `.env.example` como `.env.local` para desarrollo. En Vercel agrega:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PIN`

La clave `service_role` solo se utiliza dentro de las rutas del servidor y nunca se envía al navegador.

## 3. Despliegue

Sube el proyecto a GitHub, impórtalo en Vercel y deja que detecte Next.js. El comando de compilación es `npm run build`.

## Personalización por invitado

El panel de novios genera enlaces con estos parámetros:

`/?invitado=Familia%20Luna&pases=3&codigo=luna-3`

Cada invitado puede descargar desde la página un PDF personalizado cuyo botón abre ese mismo enlace.
