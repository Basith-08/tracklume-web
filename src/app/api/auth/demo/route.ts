import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const cookieName = process.env.AUTH_COOKIE_NAME || "tracklume_session";
const publicApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
const backendUrl =
  (process.env.NODE_ENV === "development"
    ? publicApiUrl || process.env.INTERNAL_API_URL
    : process.env.INTERNAL_API_URL || publicApiUrl) ||
  "http://localhost:8080/api/v1";

export async function POST() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password)
    return NextResponse.json(
      {
        error: {
          code: "DEMO_NOT_CONFIGURED",
          message: "The read-only demo is not configured.",
        },
      },
      { status: 503 },
    );

  try {
    const upstream = await fetch(
      `${backendUrl.replace(/\/$/, "")}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    const body = (await upstream.json()) as {
      data?: { access_token?: string; user?: unknown };
      error?: unknown;
    };
    if (!upstream.ok)
      return NextResponse.json(body, { status: upstream.status });
    const token = body.data?.access_token;
    if (!token)
      return NextResponse.json(
        {
          error: {
            code: "INVALID_AUTH_RESPONSE",
            message: "Demo login failed.",
          },
        },
        { status: 502 },
      );
    const response = NextResponse.json({ data: body.data?.user ?? null });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.AUTH_COOKIE_SECURE === "true",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
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
