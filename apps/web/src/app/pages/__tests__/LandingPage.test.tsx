import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "@/app/pages/LandingPage";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LandingPage", () => {
  it("renders the hero heading", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders How It Works section", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(/How StyleMirror Works/i)).toBeInTheDocument();
  });

  it("has a Start Your Fit Scan button", () => {
    renderWithProviders(<LandingPage />);
    expect(
      screen.getByRole("button", { name: /start your fit scan/i }),
    ).toBeInTheDocument();
  });
});
