import { adminPinIsValid, hasDatabase, supabaseRequest } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const defaults = {
  partner1: "Isabella",
  partner2: "Santiago",
  date: "2027-05-22T17:00:00-06:00",
  venue: "Hacienda San Gabriel",
  address: "Camino de los Olivos 18, Querétaro, Qro.",
  story: "Después de tantos caminos compartidos, elegimos uno para siempre. Queremos celebrar este nuevo capítulo rodeados de las personas que más amamos.",
  dressCode: "Formal · tonos claros y azules bienvenidos",
  giftText: "Su presencia es nuestro mejor regalo. Si desean tener un detalle con nosotros, habrá una mesa de sobres el día del evento.",
  whatsapp: "525500000000",
  audioUrl: "",
};

export async function GET() {
  if (!hasDatabase()) return Response.json({ config: defaults, demo: true });
  try {
    const rows = await supabaseRequest<Array<{ config: Config }>>("invitations?id=eq.main&select=config&limit=1");
    return Response.json({ config: rows[0]?.config || defaults });
  } catch {
    return Response.json({ config: defaults, demo: true });
  }
}

export async function POST(request: Request) {
  if (!adminPinIsValid(request)) {
    return Response.json({ error: "PIN incorrecto" }, { status: 401 });
  }
  if (!hasDatabase()) return Response.json({ error: "Configura Supabase en las variables de Vercel" }, { status: 503 });
  try {
    const payload = await request.json() as Partial<Config>;
    const config = { ...defaults, ...payload };
    await supabaseRequest("invitations?on_conflict=id", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: "main", config, updated_at: new Date().toISOString() }),
    });
    return Response.json({ config });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar" }, { status: 500 });
  }
}

type Config = typeof defaults;
