"use client";

import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Link from "next/link";

// const HERO_SECTION_MIN_HEIGHT = 866;

export default function Home() {
  const intl = useFormatMessage();
  return (
    <main className={cn("w-screen")}>
      {/* hero section */}
      <div className="relative flex flex-col items-center gap-12 pt-[293px] bg-brand-900 h-[866px] overflow-hidden">
        {/* ellipses */}
        <div className="absolute top-0 -left-[200px] rotate-[30deg] w-[600px] h-[430px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden">
          &nbsp;
        </div>
        <div className="absolute -bottom-[200px] -left-[200px] rotate-[30deg] w-[600px] h-[430px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden">
          &nbsp;
        </div>
        <div className="absolute -top-[200px] -right-[200px] rotate-[30deg] w-[600px] h-[430px] z-10 bg-circular-gradient-brand rounded-full overflow-hidden">
          &nbsp;
        </div>
        <div className="absolute -bottom-[75px] -right-[150px] rotate-[30deg] w-[600px] h-[430px] z-10 bg-circular-gradient-brand-peripheral-transparent rounded-full overflow-hidden">
          &nbsp;
        </div>
        <div className="absolute bottom-[175px] right-[75px] rotate-[30deg] w-[600px] h-[430px] z-[5] bg-circular-gradient-warning rounded-full overflow-hidden">
          &nbsp;
        </div>
        <div className="absolute bottom-[75px] left-0 rotate-[30deg] w-[600px] h-[430px] z-[5] bg-circular-gradient-warning rounded-full overflow-hidden">
          &nbsp;
        </div>

        <div className="absolute z-20 flex flex-col items-center text-center gap-12">
          <div className="mx-auto flex flex-col items-center text-center gap-10 max-w-[808px]">
            <Typography element="h2" weight="bold" className="text-natural-50">
              {intl("landing.home.hero-section.title")}
            </Typography>
            <Typography
              element="subtitle-1"
              weight="medium"
              className="text-natural-50"
            >
              {intl("landing.home.hero-section.description")}
            </Typography>
          </div>
          <Link href="https://app.litespace.org">
            <Button size="large">
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
