"use client";

import {
  HERO_SECTION_HEIGHT_PERCENT,
  LARGE_SCREEN_HERO_SECTION_HEIGHT,
  MD,
  MOBILE_HERO_SECTION_HEIGHT,
  SM,
  TABLET_HERO_SECTION_HEIGHT,
} from "@/constants/ui";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const intl = useFormatMessage();
  const [smallScreenHeight, setSmallScreenHeight] = useState(false);

  const onResize = useCallback(() => {
    if (
      window.innerHeight * HERO_SECTION_HEIGHT_PERCENT <
        MOBILE_HERO_SECTION_HEIGHT &&
      window.innerWidth < SM
    )
      setSmallScreenHeight(true);
    else if (
      window.innerHeight * HERO_SECTION_HEIGHT_PERCENT <
        TABLET_HERO_SECTION_HEIGHT &&
      window.innerWidth < MD
    )
      setSmallScreenHeight(true);
    else if (
      window.innerHeight * HERO_SECTION_HEIGHT_PERCENT <
        LARGE_SCREEN_HERO_SECTION_HEIGHT &&
      window.innerWidth > MD
    )
      setSmallScreenHeight(true);
    else setSmallScreenHeight(false);
  }, [setSmallScreenHeight]);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  useEffect(() => onResize(), [onResize]);

  return (
    <main className={cn("w-screen")}>
      <div
        className={cn(
          smallScreenHeight
            ? "h-[484px] md:h-[592px] lg:h-[866px] pt-[128px] md:pt-[152px] lg:pt-[293px]"
            : "h-[80vh] pt-[21vh] md:pt-[20vh] lg:pt-[27vh]",
          "relative flex flex-col items-center gap-12 bg-brand-900 overflow-hidden"
        )}
      >
        <div className="absolute top-[33vh] left-[72vw] rotate-[-12deg] w-[700px] h-[600px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden" />
        <div className="absolute -top-[4vh] -left-[13vw] rotate-[-12deg] w-[600px] h-[430px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden" />
        <div className="absolute top-[53vh] -left-[15vw] rotate-[-12deg] w-[530px] h-[370px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden" />
        <div className="absolute -top-[23vh] left-[74vw] rotate-[-12deg] w-[530px] h-[370px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden" />
        <div className="absolute top-[37vh] -left-[41vw] lg:top-[27vh] lg:left-[65vw] rotate-[-12deg] w-[350px] h-[250px] z-[5] bg-circular-gradient-warning rounded-full overflow-hidden" />
        <div className="absolute top-[25vh] -left-[1vw] rotate-[-12deg] w-[350px] h-[250px] z-[5] bg-circular-gradient-warning rounded-full overflow-hidden" />

        <div className="absolute z-20 flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0">
          <div className="mx-auto flex flex-col items-center text-center gap-4 md:gap-10 max-w-[83vw] md:max-w-[92vw] lg:max-w-[56vw]">
            <Typography
              weight="bold"
              className="text-natural-50 text-[1.5rem] md:text-[3rem]"
            >
              {intl("landing.home.hero-section.title")}
            </Typography>
            <Typography
              weight="medium"
              className="text-natural-50 text-[1rem] md:text-[1.5rem]"
            >
              {intl("landing.home.hero-section.description")}
            </Typography>
          </div>
          <Link href="https://app.litespace.org" className="mb-14">
            <Button size="large" className="h-auto w-auto py-4 px-8">
              <Typography
                element="body"
                weight="bold"
                className="text-natural-50"
              >
                {intl("landing.home.hero-section.start-journey-btn")}
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
