"use client";

import { env } from "@/lib/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider } from "@litespace/headless/server";
import { AtlasProvider } from "@litespace/headless/atlas";
import { ToastProvider } from "@litespace/ui/Toast";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider server={env.server}>
        <AtlasProvider>
          <ToastProvider postion="bottom-left">{children}</ToastProvider>
        </AtlasProvider>
      </ServerProvider>
    </QueryClientProvider>
  );
}
