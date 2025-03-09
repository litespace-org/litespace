import { useFormatMessage } from "@/hooks/intl";
import NotFound404 from "@litespace/assets/NotFound404";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { Landing } from "@litespace/utils/routes";
import Link from "next/link";

export const NotFound = () => {
  const intl = useFormatMessage();
  return (
    <div className="pt-[72px]">
      <div className="flex flex-col items-center gap-8 py-14 md:py-20 lg:py-[124px] px-4">
        <NotFound404 className="w-[328px] h-[324px] md:w-[458px] md:h-[324px]" />
        <div className="flex flex-col text-center gap-4 md:mt-8">
          <Typography
            tag="h4"
            className="text-subtitle-1 text-natural-950 font-bold"
          >
            {intl("home/not-found/title")}
          </Typography>
          <Typography
            tag="h6"
            className="text-body md:text-subtitle-2 font-semibold md:font-medium text-natural-950"
          >
            {intl("home/not-found/description")}
          </Typography>
        </div>
        <Button size="large">
          <Link href={Landing.Home}>
            <Typography
              tag="span"
              className="text-body font-medium text-natural-50"
            >
              {intl("home/not-found/go-back")}
            </Typography>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
