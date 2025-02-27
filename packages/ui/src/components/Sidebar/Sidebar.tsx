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
  children?: React.ReactNode;
}> = ({ links, hide, children }) => {
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
        "tw-absolute lg:tw-fixed tw-top-[72px] md:tw-top-0 tw-bottom-0 tw-start-0 tw-z-20 lg:tw-z-sidebar",
        "tw-bg-natural-50 tw-w-[166px] md:tw-w-auto tw-p-4 lg:tw-p-6 tw-shadow-app-sidebar",
        "tw-flex tw-flex-col tw-gap-6 md:tw-gap-10"
      )}
    >
      <Link
        to={Web.Root}
        className="tw-flex tw-justify-start md:tw-justify-center lg:tw-justify-start tw-items-center tw-gap-1 md:tw-gap-2"
      >
        <Logo className="tw-h-6 md:tw-h-10 md:tw-w-10 md:tw-my-[5px] lg:tw-my-0" />
        <Typography
          tag="h1"
          className={cn(
            "tw-inline-block tw-text-brand-500 tw-text-tiny lg:tw-text-subtitle-2 tw-font-bold",
            "tw-flex md:tw-hidden lg:tw-flex"
          )}
        >
          {intl("labels.litespace")}
        </Typography>
      </Link>

      {Object.keys(links).map((key, i) => 
        <div key={i} className="tw-flex tw-flex-col tw-gap-2 md:tw-gap-1.5">
          <Typography
            tag="span"
            className="tw-text-natural-800 md:tw-py-2 tw-text-tiny md:tw-text-caption tw-font-bold md:tw-text-center lg:tw-text-start"
          >
            {key}
          </Typography>
          <ul className="tw-flex tw-flex-col tw-gap-2">
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
      )}

      { children }
    </div>
  );
};

export default Sidebar;
