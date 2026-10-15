import { RouterProvider } from "react-router-dom";
import { Providers } from "@/app/providers";
import { router } from "@/app/router";

/** Root App component: providers + router. */
export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
