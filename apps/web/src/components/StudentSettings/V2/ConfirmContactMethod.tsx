import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

export function ConfirmContactMethod() {
  const intl = useFormatMessage();

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex gap-[57px] items-end">
        <div>
          <Typography
            className="text-subtitle-2 font-bold text-natural-950"
            tag="h3"
          >
            {intl("student-settings.verify-email.title")}
          </Typography>
          <Typography className="mt-4 text-body text-natural-950" tag="p">
            {intl("student-settings.verify-email.description")}
          </Typography>
        </div>
        <Button size="large" className="min-w-fit" variant="secondary">
          {intl("student-settings.verify-email.title")}
        </Button>
      </div>
      <div className="flex gap-[57px] items-end">
        <div>
          <Typography
            className="text-subtitle-2 font-bold text-natural-950"
            tag="h3"
          >
            {intl("student-settings.verify-phone.title")}
          </Typography>
          <Typography className="mt-4 text-body text-natural-950" tag="p">
            {intl("student-settings.verify-phone.description")}
          </Typography>
        </div>
        <Button size="large" className="min-w-fit" variant="secondary">
          {intl("student-settings.verify-phone.title")}
        </Button>
      </div>
    </div>
  );
}
