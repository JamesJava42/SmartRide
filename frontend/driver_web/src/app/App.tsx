import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { router } from "../routes";
import { DriverSessionProvider } from "../hooks/useDriverSession";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DriverSessionProvider>
        <RouterProvider router={router} />
      </DriverSessionProvider>
    </QueryClientProvider>
  );
}
