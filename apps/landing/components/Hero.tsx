import Ellipse from "@/components/Ellipse";
import { useFormatMessage } from "@/hooks/intl";
import { router } from "@/lib/routes";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import Link from "@/components/Common/Link";
import React from "react";

const Hero: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-12 bg-brand-900 overflow-hidden h-[480px] sm:h-[520px] md:h-[max(80vh,860px)] pt-[72px]"
      )}
    >
      <Ellipse className="flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0 z-landing-ellipses">
        <div className="mx-auto flex flex-col items-center text-center gap-4 max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            tag="h1"
            className="text-natural-50 text-subtitle-1 sm:text-h2 font-bold"
          >
            {intl("home/hero/title")}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-50 text-body sm:text-subtitle-1 font-medium"
          >
            {intl("home/hero/description")}
          </Typography>
        </div>
        <Link
          href={router.web({ route: Web.Root, full: true })}
          track={{
            event: "register",
            params: {
              src: "hero",
              action: "link",
            },
          }}
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
