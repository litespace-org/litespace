"use client";

import { Void } from "@litespace/types";
import React from "react";
import { NavbarLinks } from "@/components/Layout/NavbarLinks";

const Navbar: React.FC<{
  toggleSidebar: Void;
}> = ({ toggleSidebar }) => {
  /**
   * Kept that logic on purpose; we may need it soon
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(!!window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);
  */

  return (
    <header className="duration-300 max-w-screen-3xl self-center bg-natural-0 mx-auto">
      <NavbarLinks toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Navbar;
