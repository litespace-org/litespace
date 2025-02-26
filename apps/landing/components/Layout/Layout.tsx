"use client";
import React, { useState } from "react";
import cn from "classnames";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { AtlasProvider } from "@litespace/headless/atlas";
import { ServerProvider } from "@litespace/headless/server";
import { env } from "@/lib/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider server={env.server}>
        <AtlasProvider>
          <MediaQueryProvider>
            <body
              className={cn("relative", {
                "after:content-[''] after:absolute lg:after:hidden after:top-[72px] after:right-[166px] after:h-screen after:bottom-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm -z-50":
                  showSidebar,
              })}
            >
              <Navbar toggleSidebar={() => setShowSidebar((prev) => !prev)} />
              {showSidebar ? (
                <Sidebar hide={() => setShowSidebar(false)} />
              ) : null}
              {children}
            </body>
          </MediaQueryProvider>
        </AtlasProvider>
      </ServerProvider>
    </QueryClientProvider>
  );
};

export default Layout;
