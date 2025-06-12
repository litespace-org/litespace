import React from "react";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Link } from "react-router-dom";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import { router } from "@/lib/routes";
import { Landing } from "@litespace/utils/routes";

const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-row gap-2 items-center justify-center">
        <Logo className="h-8 w-8 sm:h-12 sm:w-12" />
        <Typography tag="p" className="text-brand-500 text-body font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <Link
        to={router.landing({ route: Landing.Home, full: true })}
        className="flex flex-row items-center gap-2 flex-shrink-0"
      >
        <Typography
          tag="p"
          className="text-brand-700 font-semibold text-caption"
        >
          {intl("labels.back-to-site")}
        </Typography>

        <ChevronLeft className="w-6 h-6 [&>*]:stroke-brand-700" />
      </Link>
    </div>
  );
};

export default Header;
