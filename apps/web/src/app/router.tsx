import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppLayout";
import { AvatarPage } from "@/app/pages/AvatarPage";
import { CaptureFlowPage } from "@/app/pages/CaptureFlowPage";
import { DevCatalogPage } from "@/app/pages/DevCatalogPage";
import { DevDesignSystemPage } from "@/app/pages/DevDesignSystemPage";
import { FabricsPage } from "@/app/pages/FabricsPage";
import { LandingPage } from "@/app/pages/LandingPage";
import { PrivacyPage } from "@/app/pages/PrivacyPage";
import { SuggestionsPage } from "@/app/pages/SuggestionsPage";
import { TryOnPage } from "@/app/pages/TryOnPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "scan", element: <CaptureFlowPage /> },
      { path: "avatar", element: <AvatarPage /> },
      { path: "tryon", element: <TryOnPage /> },
      { path: "suggestions", element: <SuggestionsPage /> },
      { path: "fabrics", element: <FabricsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      // Developer / Testing routes
      { path: "dev/catalog", element: <DevCatalogPage /> },
      { path: "dev/design-system", element: <DevDesignSystemPage /> },
    ],
  },
]);
