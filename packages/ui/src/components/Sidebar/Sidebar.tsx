import cn from "classnames";
import React, { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "@litespace/assets/Logo";
import { Web } from "@litespace/utils/routes";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

import {
  MOBILE_NAVBAR_HEIGHT,
  MOBILE_SIDEBAR_WIDTH,
  TABLET_NAVBAR_HEIGHT,
} from "@/components/Sidebar/constants";

import { LinkInfo } from "@/components/Sidebar/types";
import { Typography } from "@/components/Typography";
import { Item } from "@/components/Sidebar/Item";
import { useFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";

export const Sidebar: React.FC<{
  links: Record<string, LinkInfo[]>;
  hide: Void;
  className?: string;
  children?: React.ReactNode;
}> = ({ links, className, hide, children }) => {
  const { md } = useMediaQuery();
  const intl = useFormatMessage();

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const backdropXEnd = window.innerWidth - MOBILE_SIDEBAR_WIDTH;
      const backdropYStart = !md ? MOBILE_NAVBAR_HEIGHT : TABLET_NAVBAR_HEIGHT;
      if (e.pageX < backdropXEnd && e.pageY > backdropYStart) hide();
    },
    [hide, md]
  );

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onMouseDown]);

  return (
    <div
      className={cn(
        "absolute lg:static top-[72px] md:top-0 bottom-0 start-0 z-20 lg:z-sidebar",
        "bg-natural-50 w-[166px] md:w-[98px] lg:w-60 p-4 lg:p-6 shadow-app-sidebar",
        "flex flex-col gap-6 md:gap-10",
        className
      )}
    >
      <Link
        to={Web.Root}
        className="flex justify-start md:justify-center lg:justify-start items-center gap-1 md:gap-2"
      >
        <Logo className="h-6 md:h-10 md:w-10 md:my-[5px] lg:my-0" />
        <Typography
          tag="h1"
          className={cn(
            "inline-block text-brand-500 text-tiny lg:text-subtitle-2 font-bold",
            "flex md:hidden lg:flex"
          )}
        >
          {intl("labels.litespace")}
        </Typography>
      </Link>

      {Object.keys(links).map((key, i) => (
        <div key={i} className="flex flex-col gap-2 md:gap-1.5">
          <Typography
            tag="span"
            className="text-natural-800 md:py-2 text-tiny md:text-caption font-bold md:text-center lg:text-start"
          >
            {key}
          </Typography>
          <ul className="flex flex-col gap-2">
            {links[key].map(({ label, route, Icon, isActive, tail }) => (
              <>
                <Item
                  key={label}
                  to={route}
                  label={label}
                  active={isActive}
                  Icon={Icon}
                  hide={hide}
                />
                {tail}
              </>
            ))}
          </ul>
        </div>
      ))}

      {children}
    </div>
  );
};

export default Sidebar;
