import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Loader } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";

export const LoadingChat = () => {
  const intl = useFormatMessage();

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col gap-[157px] p-6">
      <Typography
        weight="bold"
        element="subtitle-2"
        className=" text-natural-950 mb-6"
      >
        {intl("chat.title")}
      </Typography>
      <div>
        <Loader variant="large" text={intl("chat.loading")} />
      </div>
    </div>
  );
};
