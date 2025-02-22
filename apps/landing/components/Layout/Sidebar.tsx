"use client";

import {
  PAGES,
  SMALL_SCREEN_NAVBAR_HEIGHT_PX,
  SMALL_SCREEN_SIDEBAR_WIDTH_PX,
} from "@/constants/ui";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Link from "next/link";
import React, { useEffect, useCallback } from "react";
import { Void } from "@litespace/types";

const Sidebar: React.FC<{ hide: Void }> = ({ hide }) => {
  const intl = useFormatMessage();

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (typeof window === "undefined") return;
      const backdropXEnd = window.innerWidth - SMALL_SCREEN_SIDEBAR_WIDTH_PX;
      const backdropYStart = SMALL_SCREEN_NAVBAR_HEIGHT_PX;
      if (e.pageX < backdropXEnd && e.pageY > backdropYStart) hide();
    },
    [hide]
  );

  useEffect(() => {
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [onClick]);

  return (
    <nav className="fixed flex lg:hidden right-0 top-[72px] bottom-0 max-w-[166px] p-4 bg-natural-50 flex-col gap-6">
      <div className={cn("flex flex-col lg:flex-row gap-6 items-start")}>
        {PAGES.map((page) => (
          <Link href={page.route} key={page.route}>
            <Typography
              tag="span"
              className="text-natural-800 text-tiny-text font-bold"
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
              tag="span"
              className="text-natural-50 text-caption font-semibold"
            >
              {intl("navbar/register")}
            </Typography>
          </Button>
        </Link>
        <Link
          href="https://app.litespace.org/login"
          className="w-[134px] flex-1"
        >
          <Button size="large" variant="secondary" className="w-full">
            <Typography
              tag="span"
              className="text-brand-700 text-caption font-semibold"
            >
              {intl("navbar/login")}
            </Typography>
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
