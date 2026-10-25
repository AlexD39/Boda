import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var bodaPool: Pool | undefined;
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no está configurada");
  if (!global.bodaPool) {
    global.bodaPool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" && !connectionString.includes("localhost")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 5,
    });
  }
  return global.bodaPool;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export function adminPinIsValid(request: Request) {
  const expected = process.env.ADMIN_PIN || (process.env.NODE_ENV === "development" ? "2027" : "");
  return Boolean(expected && request.headers.get("x-admin-pin") === expected);
}
