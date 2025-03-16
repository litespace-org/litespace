import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales/request";
import { Typography } from "@litespace/ui/Typography";
import AstroStudent1 from "@litespace/assets/AstroStudent1";
import AstroStudent2 from "@litespace/assets/AstroStudent2";
import AstroStudent3 from "@litespace/assets/AstroStudent3";
import AstroStudent4 from "@litespace/assets/AstroStudent4";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import Link from "@/components/Common/Link";
import { Button } from "@litespace/ui/Button";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import InViewTrack from "@/components/Common/InViewTrack";

const features: Array<{
  title: LocalId;
  desc: LocalId;
  icon: React.ReactNode;
}> = [
  {
    title: "home/features/outstanding-experience/title",
    desc: "home/features/outstanding-experience/description",
    icon: (
      <AstroStudent1 className="w-[156px] h-[145px] md:w-[377px] md:h-[351px] md:pt-[14px] md:pb-[1px] lg:w-[461px] lg:h-[415px] lg:pt-[18px] lg:pb-[1px] lg:pr-[5px]" />
    ),
  },
  {
    title: "home/features/book-from-any-where/title",
    desc: "home/features/book-from-any-where/description",
    icon: (
      <AstroStudent2 className="w-[127px] h-[145px] md:w-[376px] md:h-[428px] md:p-[1px] lg:w-[405px] lg:h-[462px]" />
    ),
  },
  {
    title: "home/features/free-tutor-choosing/title",
    desc: "home/features/free-tutor-choosing/description",
    icon: (
      <AstroStudent3 className="w-[157px] h-[145px] md:w-[377px] md:h-[348px] lg:w-[469px] lg:h-[432px]" />
    ),
  },
  {
    title: "home/features/deserved-care/title",
    desc: "home/features/deserved-care/description",
    icon: (
      <AstroStudent4 className="w-[142px] h-[145px] md:w-[372px] md:h-[386px] md:py-[7px] md:pr-1 lg:w-[367px] lg:h-[376px]" />
    ),
  },
];

export const Features: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="px-4 md:px-8 bg-natural-50 py-14 md:py-20 lg:py-[120px] max-w-screen-3xl mx-auto">
      <div className="flex flex-col gap-4 mb-8 md:mb-16 lg:mb-24 max-w-[837px] mx-auto text-center">
        <Typography
          tag="h3"
          className="text-subtitle-1 md:text-h3 font-bold text-natural-950"
        >
          {intl("home/features/title")}
        </Typography>

        <Typography
          tag="h6"
          className="text-body md:text-subtitle-2 font-medium md:font-semibold  text-natural-700"
        >
          {intl("home/features/description")}
        </Typography>
      </div>
      <div className="flex flex-col gap-[86px] md:gap-16 lg:gap-24">
        {features.map((feature) => (
          <div
            className="lg:h-[463px] flex flex-col-reverse md:flex-row md:even:flex-row-reverse items-center gap-4 md:justify-center lg:gap-20 lg:items-center"
            key={feature.title}
          >
            <InViewTrack
              event="view_promotion"
              action="scroll"
              src="features-section"
              title={intl(feature.title)}
            />
            <div className="flex flex-col text-center md:text-start gap-4 md:gap-6 max-w-[380px] md:max-w-[377px] lg:max-w-[598px]">
              <Typography
                tag="h2"
                className="text-subtitle-2 md:text-h4 lg:text-h3 font-bold text-natural-950"
              >
                {intl(feature.title)}
              </Typography>
              <Typography
                tag="p"
                className="text-body md:text-subtitle-2 font-medium md:font-semibold text-natural-700"
              >
                {intl(feature.desc)}
              </Typography>

              <div className="mx-auto md:mx-[unset]">
                <Link
                  href={router.web({
                    route: Web.Register,
                    role: "student",
                    full: true,
                  })}
                  track={{
                    event: "register",
                    params: {
                      action: "link",
                      src: "features-section",
                      label: intl(feature.title),
                    },
                  }}
                >
                  <Button
                    endIcon={<LongLeftArrow className="icon" />}
                    size="large"
                  >
                    <Typography
                      tag="p"
                      className="text-caption md:text-body font-semibold md:font-bold text-natural-50"
                    >
                      {intl("home/features/start-your-journey")}
                    </Typography>
                  </Button>
                </Link>
              </div>
            </div>
            {feature.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
