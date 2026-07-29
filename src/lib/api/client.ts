import type { ApiErrorShape, Collection, PageMeta } from "@/types";

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string[]>;
  requestId?: string;

  constructor(
    status: number,
    message: string,
    code = "API_ERROR",
    fields?: Record<string, string[]>,
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { data: text };
  }
}

type ParsedResponse = ApiErrorShape & {
  data?: unknown;
  meta?: PageMeta;
};

async function request(
  path: string,
  init: RequestInit = {},
): Promise<ParsedResponse | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const signal = init.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;
  try {
    const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
      ...init,
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      credentials: "same-origin",
    });
    const body = (await parseResponse(response)) as ParsedResponse | null;
    if (!response.ok) {
      const error = body?.error;
      throw new ApiError(
        response.status,
        error?.message ?? "Something went wrong. Please try again.",
        error?.code,
        error?.fields,
        error?.request_id,
      );
    }
    return body;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw new ApiError(
        408,
        "The request timed out. Please try again.",
        "TIMEOUT",
      );
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const body = await request(path, init);
  return (body && "data" in body ? body.data : body) as T;
}

export function queryString(
  params: Record<string, string | number | undefined | null>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    )
      search.set(key, String(value));
  });
  return search.toString();
}

export async function apiCollection<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
) {
  const query = params ? queryString(params) : "";
  const body = await request(`${path}${query ? `?${query}` : ""}`);
  return {
    data: (body?.data ?? []) as T[],
    meta: body?.meta ?? { page: 1, per_page: 20, total: 0, total_pages: 0 },
  } satisfies Collection<T>;
}
