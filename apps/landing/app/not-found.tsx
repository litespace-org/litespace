import { useFormatMessage } from "@/hooks/intl";
import NotFound404 from "@litespace/assets/NotFound404";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { Landing } from "@litespace/utils/routes";
import Link from "@/components/Common/Link";

export const NotFound = () => {
  const intl = useFormatMessage();
  return (
    <div className="mt-[72px] min-h-[calc(100vh-392px)] flex flex-col justify-center items-center gap-8 py-14 md:py-20 lg:py-[124px] px-4">
      <NotFound404 className="w-[328px] h-[324px] md:w-[458px] md:h-[324px]" />
      <div className="flex flex-col text-center gap-4 md:mt-8">
        <Typography
          tag="h4"
          className="text-subtitle-1 text-natural-950 font-bold"
        >
          {intl("not-found/title")}
        </Typography>
        <Typography
          tag="h6"
          className="text-body md:text-subtitle-2 font-semibold md:font-medium text-natural-950"
        >
          {intl("not-found/description")}
        </Typography>
      </div>
      <Button size="large">
        <Link
          href={Landing.Home}
          track={{
            event: "navigation",
            params: {
              src: "not-found-page",
              action: "link",
              label: "Go home",
            },
          }}
        >
          <Typography
            tag="span"
            className="text-body font-medium text-natural-50"
          >
            {intl("not-found/go-back")}
          </Typography>
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
