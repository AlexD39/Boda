import { adminPinIsValid, hasDatabase, query } from "../../../lib/db";
import { defaultInvitationConfig, normalizeInvitationConfig, type InvitationConfig } from "../../../lib/invitation-config";

export const runtime = "nodejs";

export async function GET() {
  if (!hasDatabase()) return Response.json({ config: defaultInvitationConfig, demo: true });
  try {
    const result = await query<{ config: Partial<InvitationConfig> }>("select config from invitations where id = $1 limit 1", ["main"]);
    return Response.json({ config: normalizeInvitationConfig(result.rows[0]?.config) });
  } catch {
    return Response.json({ config: defaultInvitationConfig, demo: true });
  }
}

export async function POST(request: Request) {
  if (!adminPinIsValid(request)) return Response.json({ error: "NIP incorrecto" }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: "Configura PostgreSQL en las variables del servidor" }, { status: 503 });
  try {
    const config = normalizeInvitationConfig(await request.json() as Partial<InvitationConfig>);
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
