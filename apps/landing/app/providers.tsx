"use client";

import { env } from "@/lib/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider } from "@litespace/headless/server";
import { AtlasProvider } from "@litespace/headless/atlas";
import { ToastProvider } from "@litespace/ui/Toast";
import { useEffect, useState } from "react";
import { AbstractStorage, mockStorage } from "@litespace/headless/storage";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storage, setStorage] = useState<AbstractStorage>(mockStorage);

  useEffect(() => {
    setStorage(localStorage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider server={env.server} storage={storage}>
        <AtlasProvider>
          <ToastProvider location="bottom">{children}</ToastProvider>
        </AtlasProvider>
      </ServerProvider>
    </QueryClientProvider>
  );
}
