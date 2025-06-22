import React from "react";
import LandingHomeCta from "@litespace/assets/LandingHomeCta";
import { Typography } from "@litespace/ui/Typography";
import Link from "next/link";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

const CTA: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="bg-[#121212] flex justify-center items-center py-40">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-21 w-full h-full justify-center items-center">
        <LandingHomeCta className="w-2/3 md:w-1/3" />

        <div className="flex flex-col gap-4 justify-center text-center">
          <Typography
            tag="p"
            className="text-subtitle-2 lg:text-subtitle-1 text-white font-medium"
          >
            {intl("home/cta/title")}
          </Typography>
          <Typography
            tag="p"
            className="text-subtitle-1 lg:text-h4 font-bold text-white"
          >
            {intl("home/cta/description")}
          </Typography>
          <Link
            href={router.web({
              route: Web.Register,
              role: "student",
              full: true,
            })}
            tabIndex={-1}
          >
            <Button size="large" className="mt-2 mx-auto" htmlType="button">
              <Typography tag="span" className="text font-medium text-body">
                {intl("home/cta/link")}
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA;
