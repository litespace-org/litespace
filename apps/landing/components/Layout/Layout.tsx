"use client";

import React, { useEffect, useState } from "react";
import cn from "classnames";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import Footer from "@/components/Layout/Footer";
import clarity, { getCustomeId, sessionId } from "@/lib/clarity";
import { usePathname } from "next/navigation";
import FacebookPixel from "@/components/Layout/FacebookPixel";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const path = usePathname();

  useEffect(() => {
    clarity.identify(getCustomeId(), sessionId, path);
  }, [path]);

  return (
    <body
      className={cn("relative overflow-x-hidden", {
        "after:content-[''] after:absolute lg:after:hidden after:top-[72px] after:right-[166px] after:h-screen after:bottom-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm h-screen overflow-hidden":
          showSidebar,
      })}
    >
      <FacebookPixel />
      <Navbar toggleSidebar={() => setShowSidebar((prev) => !prev)} />
      {showSidebar ? <Sidebar hide={() => setShowSidebar(false)} /> : null}
      {children}
      <Footer />
    </body>
  );
};

export default Layout;
