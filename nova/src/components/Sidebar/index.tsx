import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cn from "classnames";
import { Link } from "react-router-dom";
import { messages } from "@litespace/luna";
import { Clock, CreditCard, Home, Settings } from "react-feather";

const Sidebar: React.FC = () => {
  const intl = useIntl();
  const pages = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: messages["sidebar.home"],
        }),
        Icon: Home,
      },
      {
        label: intl.formatMessage({
          id: messages["sidebar.schedule"],
        }),
        Icon: Clock,
        current: true,
      },
      {
        label: intl.formatMessage({
          id: messages["sidebar.subscription"],
        }),
        Icon: CreditCard,
      },
      {
        label: intl.formatMessage({
          id: messages["sidebar.settings"],
        }),
        Icon: Settings,
      },
    ],
    [intl]
  );

  return (
    <div>
      <nav
        className={cn(
          "w-[15rem] border-l h-full bg-dash-sidebar border-border shadow-xl",
          "transition-[width] duration-200 pt-[48px]",
          "flex flex-col justify-start items-center text-right px-2 gap-y-1"
        )}
      >
        {pages.map(({ label, Icon, current }) => (
          <Link
            to="/"
            key={label}
            className={cn(
              "w-full cursor-pointer transition-colors duration-200",
              "hover:text-foreground px-2 h-11",
              "flex flex-row items-center rounded-md space-x-2",
              {
                "text-foreground bg-selection hover:bg-selection": current,
                "text-foreground-light hover:bg-surface-200 ": !current,
              }
            )}
          >
            {<Icon className="w-[20px] h-[20px] inline-block ml-3" />}
            <span className="inline-block">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
