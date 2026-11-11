"use client";

import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { initClientSentry } from "@/lib/sentry";
import { initAuthTokenRefreshListener } from "@/lib/api";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => {
    initClientSentry();
    return initAuthTokenRefreshListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
