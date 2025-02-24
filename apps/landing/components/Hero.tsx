"use client";

import React, { useCallback, useEffect } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Ellipse from "@/components/Ellipse";
import cn from "classnames";
import Link from "next/link";
import { useTrackFacebookEvent } from "@litespace/headless/analytics";
import { IAnalytics } from "@litespace/types";
import { useSearchParams } from "next/navigation";
import { formatFbc } from "@/lib/analytics";

const Hero: React.FC = () => {
  const intl = useFormatMessage();

  const facebookTracker = useTrackFacebookEvent();
  const searchParams = useSearchParams();

  const fbclid = searchParams.get("fbclid");

  useEffect(() => {
    facebookTracker.mutate({
      eventName: IAnalytics.EventType.PageView,
      eventSourceUrl: window.location.href,
      fbc: formatFbc(fbclid),
      customData: {
        page: "Home Page",
      },
    });
    // eslint-disable-next-line
  }, []);

  const sendPixelEvent = useCallback(
    () =>
      facebookTracker.mutate({
        eventName: IAnalytics.EventType.Register,
        eventSourceUrl: window.location.href,
        fbc: formatFbc(fbclid),
        customData: {
          page: "Home Page",
        },
      }),
    // eslint-disable-next-line
    []
  );

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-12 bg-brand-900 overflow-hidden h-[480px] sm:h-[520px] md:h-[max(80vh,860px)] pt-[72px]"
      )}
    >
      <Ellipse className="flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0 z-20">
        <div className="mx-auto flex flex-col items-center text-center gap-4 max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            tag="h1"
            className="text-natural-50 text-subtitle-1 sm:text-h2 font-bold"
          >
            {intl("home/hero/title")}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-50 text-[1rem] md:text-[1.5rem] font-medium"
          >
            {intl("home/hero/description")}
          </Typography>
        </div>
        <Link
          onClick={sendPixelEvent}
          href="https://app.litespace.org"
          className="mb-14"
        >
          <Button size="large" className="h-auto w-auto py-4 px-8">
            <Typography
              tag="span"
              className="text-natural-50 text-body font-bold"
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
