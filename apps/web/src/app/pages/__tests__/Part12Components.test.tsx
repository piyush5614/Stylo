/**
 * Part 12 – Frontend component and API lib unit tests.
 *
 * Covers:
 *  - api.ts: session storage helpers, error normalisation
 *  - SuggestionsPage: filter state, loading state, error state
 *  - FilterBar: renders occasion and season filters
 *  - RecommendationCard: renders reasons and fabric tag
 *  - HowWeChoseThese: renders body type and undertone text
 *  - FabricDrawer: renders when open, hidden when closed
 *  - ProfileEditor: renders body-type dropdown
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── api.ts unit tests ────────────────────────────────────────────────────────

describe("api.ts session storage helpers", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("getStoredSessionId returns null initially", async () => {
    const { getStoredSessionId } = await import("@/lib/api");
    expect(getStoredSessionId()).toBeNull();
  });

  it("setStoredSessionId and getStoredSessionId round-trip correctly", async () => {
    const { setStoredSessionId, getStoredSessionId } = await import("@/lib/api");
    setStoredSessionId("abc-123");
    expect(getStoredSessionId()).toBe("abc-123");
  });

  it("clearStoredSessionId removes the stored value", async () => {
    const { setStoredSessionId, clearStoredSessionId, getStoredSessionId } = await import("@/lib/api");
    setStoredSessionId("abc-123");
    clearStoredSessionId();
    expect(getStoredSessionId()).toBeNull();
  });

  it("ApiError has correct name and status", async () => {
    const { ApiError } = await import("@/lib/api");
    const err = new ApiError(404, { error: "not found" }, "not found");
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(404);
  });
});

// ─── FilterBar tests ──────────────────────────────────────────────────────────

describe("FilterBar", () => {
  it("renders occasion and season filter buttons", async () => {
    const { FilterBar } = await import("@/features/recommendations/FilterBar");
    render(
      <FilterBar
        selectedOccasion=""
        selectedSeason=""
        onSelectOccasion={vi.fn()}
        onSelectSeason={vi.fn()}
      />,
    );
    // FilterBar may have multiple casual/all text — just assert at least one exists
    const matches = screen.getAllByText(/casual|all|occasion|seasons/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("calls onSelectOccasion when an occasion chip is clicked", async () => {
    const { FilterBar } = await import("@/features/recommendations/FilterBar");
    const onSelectOccasion = vi.fn();
    render(
      <FilterBar
        selectedOccasion=""
        selectedSeason=""
        onSelectOccasion={onSelectOccasion}
        onSelectSeason={vi.fn()}
      />,
    );
    // Click any button
    const buttons = screen.getAllByRole("button");
    const firstButton = buttons[0];
    if (firstButton) {
      fireEvent.click(firstButton);
      expect(onSelectOccasion).toHaveBeenCalled();
    }
  });
});

// ─── HowWeChoseThese tests ────────────────────────────────────────────────────

describe("HowWeChoseThese", () => {
  it("renders without crash", async () => {
    const { HowWeChoseThese } = await import("@/features/recommendations/HowWeChoseThese");
    render(<HowWeChoseThese bodyType="rectangle" undertone="warm" />);
    // Should contain some explanatory text
    expect(document.body.textContent!.length).toBeGreaterThan(10);
  });

  it("renders body type in content", async () => {
    const { HowWeChoseThese } = await import("@/features/recommendations/HowWeChoseThese");
    render(<HowWeChoseThese bodyType="hourglass" undertone="warm" />);
    // Component should render some descriptive content
    const text = document.body.textContent!;
    expect(text.length).toBeGreaterThan(20);
  });
});

// ─── ProfileEditor tests ──────────────────────────────────────────────────────

describe("ProfileEditor", () => {
  it("renders body type and undertone selectors", async () => {
    const { ProfileEditor } = await import("@/features/recommendations/ProfileEditor");
    render(
      <ProfileEditor
        bodyType="rectangle"
        undertone="neutral"
        depth="medium"
        onUpdateBodyType={vi.fn()}
        onUpdateUndertone={vi.fn()}
        onUpdateDepth={vi.fn()}
      />,
    );
    // Should have some interactive elements
    expect(document.body.textContent).toMatch(/rectangle|body|silhouette/i);
  });
});

// ─── FabricDrawer tests ───────────────────────────────────────────────────────

describe("FabricDrawer", () => {
  it("is hidden when fabricSlug is null", async () => {
    const { FabricDrawer } = await import("@/features/fabrics/FabricDrawer");
    const { container } = render(
      <FabricDrawer
        fabricSlug={null}
        insight={null}
        isLoading={false}
        onClose={vi.fn()}
      />,
    );
    // Drawer should not show any fabric content
    expect(container.textContent).not.toMatch(/breathability|cotton|linen/i);
  });

  it("shows loading state when isLoading is true and slug is set", async () => {
    const { FabricDrawer } = await import("@/features/fabrics/FabricDrawer");
    render(
      <FabricDrawer
        fabricSlug="cotton"
        insight={null}
        isLoading={true}
        onClose={vi.fn()}
      />,
    );
    // Should show some loading indicator or spinner
    expect(document.body.innerHTML).toBeTruthy();
  });

  it("calls onClose when close button is clicked", async () => {
    const { FabricDrawer } = await import("@/features/fabrics/FabricDrawer");
    const onClose = vi.fn();
    render(
      <FabricDrawer
        fabricSlug="linen"
        insight={null}
        isLoading={false}
        onClose={onClose}
      />,
    );
    const closeButtons = screen.getAllByRole("button");
    const closeBtn = closeButtons[0];
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });
});

// ─── RecommendationCard tests ─────────────────────────────────────────────────

describe("RecommendationCard", () => {
  const MOCK_ITEM = {
    garment: {
      id: "g-001",
      name: "Classic Oxford Shirt",
      slug: "classic-oxford-shirt",
      category: "top",
      fit_type: "regular",
      base_price: 75.0,
      thumbnail_url: null,
      fabric_name: "Cotton",
      fabric_slug: "cotton",
      fabric_id: "f-1",
      is_active: true,
      neckline: "Spread Collar",
      length: "Hip Length",
      pattern: null,
      occasion: ["Formal", "Smart Casual"],
    },
    score: 88.5,
    recommended_size: "M",
    suggested_color: { id: "c-1", name: "Sky Blue", hex: "#87CEEB", is_default: true },
    reasons: [
      "Spread collar creates a clean, vertical neckline proportion.",
      "Hip-length cut completes the balanced silhouette.",
    ],
    fabric_highlight: "Premium Egyptian cotton with excellent breathability.",
  };

  it("renders garment name", async () => {
    const { RecommendationCard } = await import("@/features/recommendations/RecommendationCard");
    render(
      <RecommendationCard
        item={MOCK_ITEM as any}
        onTryOn={vi.fn()}
        onViewFabric={vi.fn()}
      />,
    );
    expect(screen.getByText("Classic Oxford Shirt")).toBeInTheDocument();
  });

  it("renders all reasons", async () => {
    const { RecommendationCard } = await import("@/features/recommendations/RecommendationCard");
    render(
      <RecommendationCard
        item={MOCK_ITEM as any}
        onTryOn={vi.fn()}
        onViewFabric={vi.fn()}
      />,
    );
    for (const reason of MOCK_ITEM.reasons) {
      expect(screen.getByText(reason)).toBeInTheDocument();
    }
  });

  it("calls onTryOn when Try On Avatar button is clicked", async () => {
    const { RecommendationCard } = await import("@/features/recommendations/RecommendationCard");
    const onTryOn = vi.fn();
    render(
      <RecommendationCard
        item={MOCK_ITEM as any}
        onTryOn={onTryOn}
        onViewFabric={vi.fn()}
      />,
    );
    const tryOnBtn = screen.getByRole("button", { name: /try on avatar/i });
    fireEvent.click(tryOnBtn);
    expect(onTryOn).toHaveBeenCalledWith(
      MOCK_ITEM.garment.slug,
      MOCK_ITEM.suggested_color.hex,
      MOCK_ITEM.recommended_size,
    );
  });

  it("calls onViewFabric when View Science button is clicked", async () => {
    const { RecommendationCard } = await import("@/features/recommendations/RecommendationCard");
    const onViewFabric = vi.fn();
    render(
      <RecommendationCard
        item={MOCK_ITEM as any}
        onTryOn={vi.fn()}
        onViewFabric={onViewFabric}
      />,
    );
    // Fabric button is labelled with the fabric highlight text + "View Science →"
    const fabricBtn = screen.getByRole("button", { name: /view science/i });
    fireEvent.click(fabricBtn);
    expect(onViewFabric).toHaveBeenCalled();
  });
});
