import React from "react";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Link } from "react-router-dom";
import ArrowLeft from "@litespace/assets/ArrowLeft";

const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-row gap-2 items-center justify-center">
        <Logo className="h-[48px]" />
        <Typography element="body" weight="bold" className="text-brand-500">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <Link to="https://litespace.org" className="flex flex-row gap-2">
        <Typography
          element="caption"
          weight="semibold"
          className="text-brand-700"
        >
          {intl("labels.back-to-site")}
        </Typography>

        <ArrowLeft className="[&>*]:stroke-brand-700" />
      </Link>
    </div>
  );
};

export default Header;
