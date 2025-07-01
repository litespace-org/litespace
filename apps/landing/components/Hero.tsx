import { useFormatMessage } from "@/hooks/intl";
import { router } from "@/lib/routes";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import Link from "@/components/Common/Link";
import { Highlight } from "@/components/Common/Highlight";
import { RiveAnimate } from "@/components/Common/RiveAnimate";

const Hero: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "relative flex flex-col lg:flex-row items-center justify-center gap-10 bg-natural-0 overflow-hidden",
        "h-[75vh] sm:h-auto md:h-[75vh] sm:mt-16 py-16 lg:px-[108px]"
      )}
    >
      <div className="flex flex-col text-center justify-center gap-6 px-4 md:px-0 w-full">
        <div className="mx-auto flex flex-col items-center gap-4 lg:text-right max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            tag="h1"
            className="text-natural-950 text-subtitle-1 md:text-h2 font-bold lg:w-full"
          >
            <Highlight id="home/hero/title" />
          </Typography>
          <Typography
            tag="p"
            className="text-natural-700 text-body md:text-subtitle-2 font-medium lg:w-full"
          >
            <Highlight id="home/hero/description" />
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
          className="flex justify-center lg:justify-start"
        >
          <Button size="large" className="py-2 px-4">
            <Typography
              tag="span"
              className="text-natural-50 text-body font-semibold"
            >
              {intl("home/hero/start-your-journey")}
            </Typography>
          </Button>
        </Link>
      </div>

      <div className="flex justify-center items-center h-[200px] md:h-full w-full">
        <RiveAnimate animation="hero" state="State Machine 1" />
      </div>
    </div>
  );
};

export default Hero;
