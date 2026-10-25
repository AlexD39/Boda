import { adminPinIsValid, hasDatabase, query } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const guestName = String(body.guestName || "").trim();
    const attendance = body.attendance === "no" ? "no" : "yes";
    const guests = Math.max(1, Math.round(Number(body.guests) || 1));
    if (!guestName) return Response.json({ error: "Escribe tu nombre" }, { status: 400 });
    if (!hasDatabase()) return Response.json({ error: "Configura Supabase antes de recibir confirmaciones" }, { status: 503 });
    const result = await query(
      `insert into rsvps (guest_name, attendance, guests, message, invitation_code)
       values ($1, $2, $3, $4, $5) returning *`,
      [guestName, attendance, guests, String(body.message || "").slice(0, 500), String(body.invitationCode || "").slice(0, 80)],
    );
    const rsvp = result.rows[0];
    return Response.json({ rsvp }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible confirmar" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!adminPinIsValid(request)) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDatabase()) return Response.json({ rsvps: [], demo: true });
  try {
    const result = await query<Record<string, unknown>>("select * from rsvps order by created_at desc limit 200");
    const mapped = result.rows.map(row => ({ id: row.id, guestName: row.guest_name, attendance: row.attendance, guests: row.guests, message: row.message, createdAt: row.created_at }));
    return Response.json({ rsvps: mapped });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible consultar" }, { status: 500 });
  }
}
