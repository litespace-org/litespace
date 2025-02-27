import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import { Icon } from "@/components/Sidebar/types";

export const Item = ({
  to,
  hide,
  Icon,
  label,
  active,
}: {
  to: string;
  Icon: Icon;
  label: React.ReactNode;
  active?: boolean;
  hide: Void;
}) => {
  return (
    <Link
      className={cn(
        "tw-flex tw-flex-row tw-justify-start md:tw-justify-center lg:tw-justify-start",
        "tw-gap-2 lg:tw-gap-4 tw-px-[14px] tw-py-2 tw-items-center",
        "tw-rounded-lg tw-transition-colors tw-duration-200 tw-group",
        {
          "tw-bg-brand-700": active,
          "tw-bg-transparent hover:tw-bg-natural-100": !active,
        }
      )}
      to={to}
      onClick={hide}
    >
      <Icon
        className={cn(
          "[&_*]:tw-transition-all [&_*]:tw-duration-200 tw-h-4 tw-w-4 md:tw-h-6 md:tw-w-6",
          {
            "[&_*]:tw-stroke-natural-50": active,
            "[&_*]:tw-stroke-natural-700": !active,
          }
        )}
      />
      <Typography
        tag="span"
        className={cn(
          "tw-flex md:tw-hidden lg:tw-flex",
          active ? "tw-text-natural-50" : "tw-text-natural-700",
          "tw-text-tiny lg:tw-text-caption tw-font-regular lg:tw-font-semibold"
        )}
      >
        {label}
      </Typography>
    </Link>
  );
};
