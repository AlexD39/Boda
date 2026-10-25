const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasDatabase() {
  return Boolean(supabaseUrl && serviceKey);
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase no está configurado");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error((await response.text()) || `Supabase respondió ${response.status}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function adminPinIsValid(request: Request) {
  const expected = process.env.ADMIN_PIN || (process.env.NODE_ENV === "development" ? "2027" : "");
  return Boolean(expected && request.headers.get("x-admin-pin") === expected);
}
