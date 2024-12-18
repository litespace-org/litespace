import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";

export const LoadingError: React.FC<{ retry: Void; error: string }> = ({
  retry,
  error,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col mt-20 gap-10 items-center justify-center">
      <div className="p-[6px] bg-destructive-200 rounded-full">
        <ExclaimationMarkCircle />
      </div>
      <Typography
        element="h4"
        weight="bold"
        className="text-natural-950 text-center"
      >
        {error}
      </Typography>
      <Button onClick={retry} variant={ButtonVariant.Secondary}>
        {intl("global.retry")}
      </Button>
    </div>
  );
};
