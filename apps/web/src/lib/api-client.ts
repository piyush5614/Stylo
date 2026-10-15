import type { HealthStatus } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Lightweight fetch wrapper with JSON parsing and error handling. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/** Check API health. */
export function fetchHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/api/v1/health");
}

export const api = { fetchHealth } as const;
