import { adminPinIsValid, hasDatabase, supabaseRequest } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const guestName = String(body.guestName || "").trim();
    const attendance = body.attendance === "no" ? "no" : "yes";
    const guests = Math.max(1, Math.min(12, Number(body.guests) || 1));
    if (!guestName) return Response.json({ error: "Escribe tu nombre" }, { status: 400 });
    if (!hasDatabase()) return Response.json({ error: "Configura Supabase antes de recibir confirmaciones" }, { status: 503 });
    const rows = await supabaseRequest<Array<Record<string, unknown>>>("rsvps", {
      method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({
        guest_name: guestName, attendance, guests,
        dietary: String(body.dietary || "").slice(0, 300),
        message: String(body.message || "").slice(0, 500),
        invitation_code: String(body.invitationCode || "").slice(0, 80),
      }),
    });
    const rsvp = rows[0];
    return Response.json({ rsvp }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible confirmar" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!adminPinIsValid(request)) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDatabase()) return Response.json({ rsvps: [], demo: true });
  try {
    const rows = await supabaseRequest<Array<Record<string, unknown>>>("rsvps?select=*&order=created_at.desc&limit=200");
    const mapped = rows.map(row => ({ id: row.id, guestName: row.guest_name, attendance: row.attendance, guests: row.guests, dietary: row.dietary, message: row.message, createdAt: row.created_at }));
    return Response.json({ rsvps: mapped });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible consultar" }, { status: 500 });
  }
}
