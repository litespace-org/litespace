"use client";

import React, { useState, useEffect } from "react";
import cn from "classnames";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import Footer from "@/components/Layout/Footer";
import ReactGA from "react-ga4";
import zod from "zod";

const gaId = zod.string();
const GA_ID = gaId.parse(process.env.NEXT_PUBLIC_GA_TRACKING_ID);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    ReactGA.initialize(GA_ID);
  }, []);

  return (
    <body
      className={cn("relative", {
        "after:content-[''] after:absolute lg:after:hidden after:top-[72px] after:right-[166px] after:h-screen after:bottom-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm h-screen overflow-hidden":
          showSidebar,
      })}
    >
      <Navbar toggleSidebar={() => setShowSidebar((prev) => !prev)} />
      {showSidebar ? <Sidebar hide={() => setShowSidebar(false)} /> : null}
      {children}
      <Footer />
    </body>
  );
};

export default Layout;
