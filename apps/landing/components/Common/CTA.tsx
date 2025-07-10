import React from "react";
import { Typography } from "@litespace/ui/Typography";
import Link from "next/link";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { RiveAnimate } from "@/components/Common/RiveAnimate";

const CTA: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="relative flex justify-center items-center h-[110vh]">
      <div
        id="CTA"
        className="bg-[#121212] absolute w-screen h-full justify-center items-center z-[9999] py-40 lg:py-0"
      >
        <div className="flex flex-col md:flex-row gap-6 lg:gap-21 w-full h-full justify-center items-center">
          <RiveAnimate
            state="main_comp"
            animation="cta"
            className="w-5/6 md:w-1/3 xl:w-[467px] min-h-[303px] md:min-h-[259px] lg:min-h-[433px]"
          />
          <div className="flex flex-col gap-4 justify-center text-center">
            <Typography
              tag="p"
              className="text-subtitle-2 lg:text-subtitle-1 text-white font-medium"
            >
              {intl("home/cta/title")}
            </Typography>
            <Typography
              tag="p"
              className="text-subtitle-1 lg:text-h4 font-bold max-w-[500px] text-white"
            >
              {intl("home/cta/description")}
            </Typography>
            <Link
              href={router.web({
                route: Web.Register,
                role: "student",
                full: true,
              })}
              className="w-fit mx-auto"
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
    </div>
  );
};

export default CTA;
