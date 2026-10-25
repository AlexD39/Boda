# Boda

Invitación digital de boda desarrollada con Next.js, React, Node.js y PostgreSQL.

## Funcionalidades

- Diseño responsive para teléfono, tableta y escritorio.
- Invitaciones individuales por nombre, cantidad de pases y código.
- Cuenta regresiva, música, galería, ubicación y código de vestimenta.
- Confirmación de asistencia almacenada en PostgreSQL.
- Aviso adicional para los novios mediante WhatsApp.
- PDF personalizado creado únicamente desde el panel privado.
- Panel en `/admin` para editar la información y revisar confirmaciones.

## Desarrollo local

Docker se utiliza únicamente para PostgreSQL:

```bash
docker compose up -d
copy .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. El panel privado está en `http://localhost:3000/admin`.

Para detener solamente la base de datos:

```bash
docker compose down
```

La conexión local ya viene preparada en `.env.example`. El NIP de desarrollo sugerido es `2027`; cámbialo antes de publicar.

## Despliegue

Consulta [README-VERCEL.md](./README-VERCEL.md) para conectar una base PostgreSQL administrada y desplegar en Vercel.
