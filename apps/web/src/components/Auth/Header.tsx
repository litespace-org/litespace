import React from "react";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { Link } from "react-router-dom";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { useWebFormatMessage } from "@/hooks/intl";

const Header: React.FC = () => {
  const intl = useWebFormatMessage();
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-row gap-2 items-center justify-center">
        <Logo className="h-[32px] sm:h-[48px]" />
        <Typography tag="p" className="text-brand-500 text-body font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <Link
        to="https://litespace.org"
        className="flex flex-row items-center gap-2"
      >
        <Typography
          tag="span"
          className="text-brand-700 font-semibold text-caption"
        >
          {intl("labels.back-to-site")}
        </Typography>

        <ArrowLeft className="[&>*]:stroke-brand-700" />
      </Link>
    </div>
  );
};

export default Header;
