/**
 * TypeScript types derived from OpenAPI schema and core domain models.
 */

import type { components } from "./api-schema";

// ─── Direct OpenAPI Schema Aliases ───
export type ApiSchemas = components["schemas"];

export type Fabric = ApiSchemas["FabricResponse"];
export type GarmentSummary = ApiSchemas["GarmentSummaryResponse"];
export type GarmentDetail = ApiSchemas["GarmentDetailResponse"];
export type GarmentColor = ApiSchemas["GarmentColorResponse"];
export type GarmentSize = ApiSchemas["GarmentSizeResponse"];
export type PaginatedGarments = ApiSchemas["PaginatedGarmentsResponse"];
export type Session = ApiSchemas["SessionResponse"];
export type CreateSessionPayload = ApiSchemas["CreateSessionRequest"];
export type HealthStatus = ApiSchemas["HealthResponse"];

// Measurement API Types
export type LandmarkPoint = ApiSchemas["LandmarkPoint"];
export type CapturedPosePayload = ApiSchemas["CapturedPosePayload"];
export type AnalyzeMeasurementsPayload = ApiSchemas["AnalyzeMeasurementsRequest"];
export type DimensionEstimate = ApiSchemas["DimensionEstimate"];
export type MeasurementAnalysis = ApiSchemas["MeasurementAnalysisResponse"];
export type UpdateBodyProfilePayload = ApiSchemas["UpdateBodyProfileRequest"];

// Try-on & Sizing API Types
export type FitRecommendation = ApiSchemas["FitRecommendationResponse"];
export type AreaFitDetail = ApiSchemas["AreaFitDetail"];

// Recommendation & Fabric API Types
export interface FabricInsight {
  fabric_slug: string;
  fabric_name: string;
  description: string;
  benefits: string[];
  care_instructions: string[];
  best_seasons: string[];
  why_it_suits_you: string;
  best_for_climate: string;
  stretch_rating: number;
  breathability_rating: number;
  durability_rating: number;
  skin_sensitivity_note?: string | null;
}

export interface RecommendationItem {
  garment: GarmentDetail;
  score: number;
  recommended_size: string;
  suggested_color?: GarmentColor | null;
  reasons: string[];
  fabric_highlight: string;
}

export interface PersonalizedRecommendationsResponse {
  session_id: string;
  detected_body_type: string;
  body_type_title: string;
  detected_undertone: string;
  detected_depth: string;
  occasion_filter?: string | null;
  season_filter?: string | null;
  items: RecommendationItem[];
  how_we_chose_these: Record<string, unknown>;
}

// ─── Frontend Helper Types ───
export type GarmentCategory = "top" | "bottom" | "outerwear" | "cap" | "dress";
export type FitType = "slim" | "regular" | "relaxed" | "oversized";

export interface GarmentFilterParams {
  category?: string;
  occasion?: string;
  fabric_id?: string;
  limit?: number;
  offset?: number;
}
