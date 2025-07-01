import { useFormatMessage } from "@/hooks/intl";
import NotFound from "@litespace/assets/404";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { Landing } from "@litespace/utils/routes";
import Link from "@/components/Common/Link";

export const Page = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col justify-center items-center gap-10 py-14 px-4">
      <NotFound className="w-[309px] h-[248px] md:w-[492px] lg:w-[576px] md:h-[398px]" />
      <div className="flex flex-col text-center gap-4">
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

export default Page;
