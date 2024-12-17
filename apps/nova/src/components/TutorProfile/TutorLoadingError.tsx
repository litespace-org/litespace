import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";

export const TutorLoadingError: React.FC<{ refetchRatings: Void }> = ({
  refetchRatings,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col mt-20 gap-10 items-center justify-center">
      <div className="p-[6px] bg-destructive-200 rounded-full">
        <ExclaimationMarkCircle />
      </div>
      <Typography element="h4" weight="bold" className="text-natural-950">
        {intl("tutor.profile.error")}
      </Typography>
      <Button onClick={refetchRatings} variant={ButtonVariant.Secondary}>
        {intl("tutor.profile.retry")}
      </Button>
    </div>
  );
};
