import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useDashFormatMessage } from "@/hooks/intl";
import { LocalDashId } from "@/lib/intl";

const BackLink: React.FC<{ to: string; name: LocalDashId }> = ({
  to,
  name,
}) => {
  const intl = useDashFormatMessage();

  return (
    <Link
      to={to}
      className="flex items-center gap-2 py-1 px-2 text-base duration-300 rounded-lg hover:bg-background-selection w-fit"
    >
      <ArrowRightIcon className="w-6 h-6" />
      <span>
        {intl("global.goto", {
          name: intl(name),
        })}
      </span>
    </Link>
  );
};

export default BackLink;
