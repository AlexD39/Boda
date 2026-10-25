import { adminPinIsValid, hasDatabase, query } from "../../../lib/db";

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
    const result = await query<{ config: Config }>("select config from invitations where id = $1 limit 1", ["main"]);
    return Response.json({ config: result.rows[0]?.config || defaults });
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
    await query(
      `insert into invitations (id, config, updated_at) values ($1, $2::jsonb, now())
       on conflict (id) do update set config = excluded.config, updated_at = now()`,
      ["main", JSON.stringify(config)],
    );
    return Response.json({ config });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar" }, { status: 500 });
  }
}

type Config = typeof defaults;
