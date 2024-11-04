import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { LocalId } from "@litespace/luna/locales";

const BackLink: React.FC<{ to: string; name: LocalId }> = ({ to, name }) => {
  const intl = useFormatMessage();

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
