interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AUTH_PEPPER: string;
}

const COOKIE = "stc_session";
const SESSION_HOURS = 12;

function apiHeaders(env: Env, extra: HeadersInit = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    ...extra,
  };
}

function response(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  return new Uint8Array(value.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? []);
}

function randomToken(bytes = 32) {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function derivePin(pin: string, salt: string, pepper: string, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${pin}:${pepper}`), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations }, key, 256));
}

function equalHex(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function cookieValue(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  return cookies.split(";").map((item) => item.trim().split("=")).find(([name]) => name === COOKIE)?.[1] ?? null;
}

async function rest(env: Env, path: string, init: RequestInit = {}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: apiHeaders(env, init.headers) });
}

async function authenticate(request: Request, env: Env) {
  const token = cookieValue(request);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const sessions = await rest(env, `authentication_sessions?token_hash=eq.${tokenHash}&revoked_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,user_id`, { method: "GET" });
  if (!sessions.ok) return null;
  const [session] = await sessions.json<Array<{ id: string; user_id: string }>>();
  if (!session) return null;
  const users = await rest(env, `platform_users?id=eq.${session.user_id}&active=eq.true&select=id,username,display_name,role`, { method: "GET" });
  if (!users.ok) return null;
  const [user] = await users.json<Array<{ id: string; username: string; display_name: string; role: string }>>();
  return user ? { user, sessionId: session.id } : null;
}

async function login(request: Request, env: Env) {
  const body = await request.json<{ username?: string; pin?: string }>().catch(() => ({}));
  const username = (body.username ?? "").trim().toLowerCase();
  const pin = body.pin ?? "";
  if (username !== "dabranches" || !/^\d{6,12}$/.test(pin)) return response({ error: "Credenciais inválidas." }, 401);
  const users = await rest(env, `platform_users?username=eq.${encodeURIComponent(username)}&select=id,username,display_name,role,pin_salt,pin_hash,pin_iterations,failed_attempts,locked_until,active`, { method: "GET" });
  const [user] = users.ok ? await users.json<Array<Record<string, unknown>>>() : [];
  if (!user || !user.active || !user.pin_hash || !user.pin_salt) return response({ error: "Acesso do proprietário ainda não configurado." }, 503);
  if (user.locked_until && new Date(String(user.locked_until)) > new Date()) return response({ error: "Acesso temporariamente bloqueado. Tente mais tarde." }, 429);
  const candidate = await derivePin(pin, String(user.pin_salt), env.AUTH_PEPPER, Number(user.pin_iterations));
  const succeeded = equalHex(candidate, String(user.pin_hash));
  await rest(env, "authentication_attempts", { method: "POST", body: JSON.stringify({ username, succeeded, source_fingerprint: await sha256(request.headers.get("cf-connecting-ip") ?? "unknown") }) });
  if (!succeeded) {
    const failed = Number(user.failed_attempts) + 1;
    const lockMinutes = failed >= 5 ? Math.min(60, 2 ** (failed - 5)) : 0;
    await rest(env, `platform_users?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ failed_attempts: failed, locked_until: lockMinutes ? new Date(Date.now() + lockMinutes * 60_000).toISOString() : null, updated_at: new Date().toISOString() }) });
    return response({ error: "Credenciais inválidas." }, 401);
  }
  await rest(env, `platform_users?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() }) });
  const token = randomToken();
  await rest(env, "authentication_sessions", { method: "POST", body: JSON.stringify({ user_id: user.id, token_hash: await sha256(token), expires_at: new Date(Date.now() + SESSION_HOURS * 3_600_000).toISOString() }) });
  return response({ user: { username: user.username, displayName: user.display_name, role: user.role } }, 200, { "set-cookie": `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}` });
}

async function dashboard(request: Request, env: Env) {
  const auth = await authenticate(request, env);
  if (!auth) return response({ error: "Não autenticado." }, 401);
  const [positions, groups, institutions] = await Promise.all([
    rest(env, "positions?order=position_date.desc&limit=1&select=*"),
    rest(env, "reconciliation_groups?order=sequence_number.asc&select=sequence_number,movement_count,balance_minor,evidence_level"),
    rest(env, "institutions?active=eq.true&order=short_name.asc&select=code,name,short_name"),
  ]);
  return response({ user: auth.user, position: (await positions.json())[0] ?? null, groups: await groups.json(), institutions: await institutions.json() });
}

async function listMovements(request: Request, env: Env) {
  if (!(await authenticate(request, env))) return response({ error: "Não autenticado." }, 401);
  const url = new URL(request.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const result = await rest(env, `movements?state=eq.open&order=movement_date.asc,source_row.asc&offset=${offset}&limit=${limit}&select=id,movement_date,dc,amount_minor,operation,description,observation,document_number,ordering_party,beneficiary,iban,bic,state`, { headers: { Prefer: "count=exact" } });
  return response({ items: await result.json(), total: Number(result.headers.get("content-range")?.split("/")[1] ?? 0), offset, limit });
}

async function logout(request: Request, env: Env) {
  const auth = await authenticate(request, env);
  if (auth) await rest(env, `authentication_sessions?id=eq.${auth.sessionId}`, { method: "PATCH", body: JSON.stringify({ revoked_at: new Date().toISOString() }) });
  return response({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    let result: Response;
    if (url.pathname === "/api/login" && request.method === "POST") result = await login(request, env);
    else if (url.pathname === "/api/session" && request.method === "GET") {
      const auth = await authenticate(request, env);
      result = auth ? response({ user: auth.user }) : response({ error: "Não autenticado." }, 401);
    } else if (url.pathname === "/api/dashboard" && request.method === "GET") result = await dashboard(request, env);
    else if (url.pathname === "/api/movements" && request.method === "GET") result = await listMovements(request, env);
    else if (url.pathname === "/api/logout" && request.method === "POST") result = await logout(request, env);
    else if (url.pathname.startsWith("/api/")) result = response({ error: "Rota não encontrada." }, 404);
    else result = await env.ASSETS.fetch(request);
    const headers = new Headers(result.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "DENY");
    headers.set("referrer-policy", "no-referrer");
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
    headers.set("content-security-policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'");
    return new Response(result.body, { status: result.status, statusText: result.statusText, headers });
  },
};
