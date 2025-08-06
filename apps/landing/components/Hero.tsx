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
        "relative flex flex-col lg:flex-row items-center lg:justify-between md:gap-10 lg:gap-0 bg-natural-0 overflow-hidden",
        "h-[calc(100vh-72px)] py-14 md:py-16 lg:py-0 lg:px-[108px] max-w-screen-3xl mx-auto w-full"
      )}
    >
      <div className="flex flex-col text-center justify-center items-center lg:items-start gap-6 px-4 md:px-0 min-w-[460px] max-w-[633px] w-full">
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
          className="flex justify-center lg:justify-start w-fit"
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

      <div className="relative w-[450px] h-[450px] xs:w-full xs:h-full">
        <div className="absolute top-0 left-0 lg:-left-24 bottom-0 right-0 flex justify-center items-center">
          <RiveAnimate animation="hero" state="State Machine 1" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
