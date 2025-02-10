"use client";

import { pages } from "@/components/layout/common";
import {
  SMALL_SCREEN_NAVBAR_HEIGHT,
  SMALL_SCREEN_SIDEBAR_WIDTH,
} from "@/types/constants";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Link from "next/link";
import React, { useEffect, useCallback } from "react";
import { Void } from "@litespace/types";

const Sidebar: React.FC<{ hide: Void }> = ({ hide }) => {
  const intl = useFormatMessage();

  const closeSidebar = useCallback((e: MouseEvent) => {
    if (typeof window === "undefined") return;

    const backdropXEnd = window.innerWidth - SMALL_SCREEN_SIDEBAR_WIDTH;
    const backdropYStart = SMALL_SCREEN_NAVBAR_HEIGHT;

    if (e.pageX < backdropXEnd && e.pageY > backdropYStart) hide();
  }, []);

  useEffect(() => {
    window.addEventListener("click", closeSidebar);
    return () => window.removeEventListener("click", closeSidebar);
  }, []);

  return (
    <div className="fixed flex lg:hidden right-0 top-[72px] bottom-0 max-w-[166px] p-4 bg-natural-50 flex-col gap-6">
      <div className={cn("flex flex-col lg:flex-row gap-6 items-start")}>
        {pages.map((page) => (
          <Link href={page.route} key={page.title}>
            <Typography
              element="tiny-text"
              weight="bold"
              className="text-natural-800"
            >
              {intl(page.title)}
            </Typography>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Link
          href="https://app.litespace.org/register/stundent"
          className="w-[134px] flex-1"
        >
          <Button size="large" className="w-full">
            <Typography
              element="caption"
              weight="semibold"
              className="text-natural-50"
            >
              {intl("navbar.register")}
            </Typography>
          </Button>
        </Link>
        <Link
          href="https://app.litespace.org/login"
          className="w-[134px] flex-1"
        >
          <Button size="large" variant="secondary" className="w-full">
            <Typography
              element="caption"
              weight="semibold"
              className="text-brand-700"
            >
              {intl("navbar.login")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
