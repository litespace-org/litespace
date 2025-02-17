"use client";

import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Ellipse from "@/components/Ellipse";
import cn from "classnames";
import Link from "next/link";

const Hero: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-12 bg-brand-900 overflow-hidden h-[480px] sm:h-[520px] md:h-[max(80vh,860px)] pt-[72px]"
      )}
    >
      <Ellipse className="flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0 z-20">
        <div className="mx-auto flex flex-col items-center text-center gap-4 max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            weight="bold"
            tag="h1"
            className="text-natural-50 text-[1.5rem] md:text-[3rem]"
          >
            {intl("home/hero/title")}
          </Typography>
          <Typography
            tag="p"
            weight="medium"
            className="text-natural-50 text-[1rem] md:text-[1.5rem]"
          >
            {intl("home/hero/description")}
          </Typography>
        </div>
        <Link href="https://app.litespace.org" className="mb-14">
          <Button size="large" className="h-auto w-auto py-4 px-8">
            <Typography
              element="body"
              weight="bold"
              className="text-natural-50"
            >
              {intl("home/hero/start-your-journey")}
            </Typography>
          </Button>
        </Link>
      </Ellipse>
    </div>
  );
};

export default Hero;
