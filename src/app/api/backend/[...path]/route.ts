import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const cookieName = process.env.AUTH_COOKIE_NAME || "tracklume_session";
const backendUrl =
  (process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL
    : process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8080/api/v1";

function tokenFrom(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const data =
    "data" in body && typeof body.data === "object" && body.data
      ? body.data
      : body;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  return typeof record.access_token === "string"
    ? record.access_token
    : typeof record.token === "string"
      ? record.token
      : null;
}

function stripToken(body: unknown) {
  if (!body || typeof body !== "object") return body;
  if ("data" in body && typeof body.data === "object" && body.data) {
    const data = { ...(body.data as Record<string, unknown>) };
    delete data.access_token;
    delete data.token;
    return { ...(body as Record<string, unknown>), data };
  }
  const safe = { ...(body as Record<string, unknown>) };
  delete safe.access_token;
  delete safe.token;
  return safe;
}

async function forward(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const suffix = params.path.join("/");
  if (suffix === "auth/logout" && request.method === "POST") {
    const response = NextResponse.json({ data: null });
    response.cookies.delete(cookieName);
    return response;
  }
  const url = `${backendUrl.replace(/\/$/, "")}/${suffix}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cookie");
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);
  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD")
    body = await request.arrayBuffer();
  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const responseText = await upstream.text();
    let responseBody: unknown = responseText;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      /* preserve non-JSON response */
    }
    const safeResponseBody =
      suffix === "auth/login" && upstream.ok
        ? stripToken(responseBody)
        : responseBody;
    const response = NextResponse.json(safeResponseBody, {
      status: upstream.status,
    });
    if (suffix === "auth/login" && upstream.ok) {
      const tokenValue = tokenFrom(responseBody);
      if (tokenValue)
        response.cookies.set(cookieName, tokenValue, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.AUTH_COOKIE_SECURE === "true",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
    }
    if (upstream.status === 401) response.cookies.delete(cookieName);
    if (suffix === "auth/logout") response.cookies.delete(cookieName);
    return response;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The Tracklume API is unavailable.",
        },
      },
      { status: 503 },
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
