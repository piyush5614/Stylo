import type {
  AnalyzeMeasurementsPayload,
  CreateSessionPayload,
  Fabric,
  FabricInsight,
  FitRecommendation,
  GarmentDetail,
  GarmentFilterParams,
  HealthStatus,
  MeasurementAnalysis,
  PaginatedGarments,
  PersonalizedRecommendationsResponse,
  Session,
  UpdateBodyProfilePayload,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Session token storage key
const SESSION_STORAGE_KEY = "stylemirror_session_id";

export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setStoredSessionId(id: string): void {
  localStorage.setItem(SESSION_STORAGE_KEY, id);
}

export function clearStoredSessionId(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/** Normalized API Error */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Base typed request client with header injection and error normalization */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Inject session header if present
  const sessionId = getStoredSessionId();
  if (sessionId && !headers.has("X-Session-Id")) {
    headers.set("X-Session-Id", sessionId);
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let errorDetail = "API request failed";
    let bodyData: unknown = null;
    try {
      bodyData = await res.json();
      if (typeof bodyData === "object" && bodyData !== null && "error" in bodyData) {
        errorDetail = String((bodyData as { error: unknown }).error);
      }
    } catch {
      errorDetail = await res.text().catch(() => "Unknown error");
    }
    throw new ApiError(res.status, bodyData, errorDetail);
  }

  return res.json() as Promise<T>;
}

// ─── API Methods ───

export const api = {
  // Health
  fetchHealth: () => request<HealthStatus>("/api/v1/health"),

  // Sessions
  createSession: (payload: CreateSessionPayload) =>
    request<Session>("/api/v1/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteSession: () =>
    request<void>("/api/v1/sessions/me", {
      method: "DELETE",
    }),

  // Catalog - Garments
  fetchGarments: (params?: GarmentFilterParams) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.occasion) query.set("occasion", params.occasion);
    if (params?.fabric_id) query.set("fabric_id", params.fabric_id);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));
    const qs = query.toString();
    return request<PaginatedGarments>(`/api/v1/catalog/garments${qs ? `?${qs}` : ""}`);
  },

  fetchGarmentDetail: (slug: string) =>
    request<GarmentDetail>(`/api/v1/catalog/garments/${slug}`),

  // Catalog - Fabrics
  fetchFabrics: () => request<Fabric[]>("/api/v1/catalog/fabrics"),

  fetchFabricDetail: (slug: string) =>
    request<Fabric>(`/api/v1/catalog/fabrics/${slug}`),

  // Measurements
  analyzeMeasurements: (payload: AnalyzeMeasurementsPayload) =>
    request<MeasurementAnalysis>("/api/v1/measurements/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  fetchProfile: () =>
    request<MeasurementAnalysis | null>("/api/v1/measurements/profile"),

  updateProfileOverrides: (payload: UpdateBodyProfilePayload) =>
    request<MeasurementAnalysis>("/api/v1/measurements/profile/overrides", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Try-on & Sizing
  fetchGarmentFit: (garmentSlug: string) =>
    request<FitRecommendation>(`/api/v1/tryon/fit?garment=${encodeURIComponent(garmentSlug)}`),

  // Recommendations & Fabrics
  fetchRecommendations: (params?: { occasion?: string; season?: string }) => {
    const query = new URLSearchParams();
    if (params?.occasion) query.set("occasion", params.occasion);
    if (params?.season) query.set("season", params.season);
    const qs = query.toString();
    return request<PersonalizedRecommendationsResponse>(
      `/api/v1/recommendations${qs ? `?${qs}` : ""}`
    );
  },

  fetchFabricInsights: (slug: string) =>
    request<FabricInsight>(`/api/v1/fabrics/${encodeURIComponent(slug)}/insights`),
} as const;
