import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { router } from "../routes/router";
import { RiderSessionProvider } from "../hooks/useRiderSession";
import { RideProvider } from "../context/RideContext";
import { ToastProvider } from "../components/common/Toast";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RiderSessionProvider>
        <ToastProvider>
          <RideProvider>
            <RouterProvider router={router} />
          </RideProvider>
        </ToastProvider>
      </RiderSessionProvider>
    </QueryClientProvider>
  );
}
