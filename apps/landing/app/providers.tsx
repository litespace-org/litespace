"use client";

import { env } from "@/lib/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider } from "@litespace/headless/server";
import { ApiProvider } from "@litespace/headless/api";
import { ToastProvider } from "@litespace/ui/Toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider server={env.server}>
        <ApiProvider>
          <ToastProvider postion="bottom-left">{children}</ToastProvider>
        </ApiProvider>
      </ServerProvider>
    </QueryClientProvider>
  );
}
