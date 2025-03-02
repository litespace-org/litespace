import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import { Icon } from "@/components/Sidebar/types";

export const Item = ({
  to,
  Icon,
  label,
  hide,
  active,
}: {
  to: string;
  label: React.ReactNode;
  hide: Void;
  Icon?: Icon;
  active?: boolean;
}) => {
  return (
    <Link
      className={cn(
        "flex flex-row justify-start md:justify-center lg:justify-start",
        "gap-2 lg:gap-4 px-[14px] py-2 items-center",
        "rounded-lg transition-colors duration-200 group",
        {
          "bg-brand-700": active,
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
      to={to}
      onClick={hide}
    >
      {Icon ? (
        <Icon
          className={cn(
            "[&_*]:transition-all [&_*]:duration-200 h-4 w-4 md:h-6 md:w-6",
            {
              "[&_*]:stroke-natural-50": active,
              "[&_*]:stroke-natural-700": !active,
            }
          )}
        />
      ) : null}
      <Typography
        tag="span"
        className={cn(
          "flex md:hidden lg:flex",
          active ? "text-natural-50" : "text-natural-700",
          "text-tiny lg:text-caption font-regular lg:font-semibold"
        )}
      >
        {label}
      </Typography>
    </Link>
  );
};
