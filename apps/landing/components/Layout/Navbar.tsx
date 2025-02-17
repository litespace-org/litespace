"use client";

import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { NavbarLinks } from "@/components/Layout/NavbarLinks";

const Navbar: React.FC<{
  toggleSidebar: Void;
}> = ({ toggleSidebar }) => {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(!!window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 shadow-app-navbar-mobile transition-colors duration-300",
        scrolled ? "bg-natural-50" : "bg-natural-50 lg:bg-transparent"
      )}
    >
      <NavbarLinks toggleSidebar={toggleSidebar} scrolled={scrolled} />
    </header>
  );
};

export default Navbar;
