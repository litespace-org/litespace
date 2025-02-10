"use client";

import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { locales } from "@litespace/ui/locales";
import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import cn from "classnames";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Cairo } from "next/font/google";

const cairo = Cairo({ subsets: ["latin"] });

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShownSidebar, setIsShownSidebar] = useState(false);

  return (
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <MediaQueryProvider>
        <body
          className={cn(cairo.className, "relative", {
            "after:content-[''] after:absolute lg:after:hidden after:top-[72px] after:right-[166px] after:h-screen after:bottom-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm -z-50":
              isShownSidebar,
          })}
        >
          <Navbar toggleSidebar={() => setIsShownSidebar((prev) => !prev)} />
          {isShownSidebar ? (
            <Sidebar hide={() => setIsShownSidebar(false)} />
          ) : null}
          {children}
        </body>
      </MediaQueryProvider>
    </IntlProvider>
  );
};

export default Providers;
