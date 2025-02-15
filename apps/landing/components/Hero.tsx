"use client";

import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Link from "next/link";

const Hero = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-12 bg-brand-900 overflow-hidden h-[480px] sm:h-[520px] md:h-[max(80vh,860px)] pt-[72px]"
      )}
    >
      <div className="flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0 z-20 w-fit relative">
        <div
          id="main-top-left"
          className="absolute -top-[500px] -left-[700px] rotate-[12deg] w-[700px] h-[500px] z-10 bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
        />
        <div
          id="main-bottom-right"
          className="absolute top-[150px] -right-[440px] rotate-[15deg] w-[600px] h-[430px] z-10 bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
        />
        <div
          id="main-bottom-left"
          className="absolute -bottom-[480px] -left-[590px] rotate-[12deg] w-[530px] h-[370px] z-10 bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
        />
        <div
          id="main-top-right"
          className="absolute -top-[550px] -right-[580px] rotate-[12deg] w-[530px] h-[370px] bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
        />
        <div
          id="warning-right"
          className="absolute top-[40px] -right-[140px] rotate-[12deg] w-[350px] h-[250px] z-[5] bg-warning-600 rounded-[50%/50%] opacity-20 blur-ellipse"
        />
        <div
          id="warning-left"
          className="absolute top-[0px] -left-[450px] rotate-[12deg] w-[350px] h-[250px] z-[5] bg-warning-600 rounded-[50%/50%] opacity-15 blur-ellipse"
        />

        <div className="mx-auto flex flex-col items-center text-center gap-4 max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            weight="bold"
            tag="h1"
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
  );
};

export default Hero;
