import { Typography } from "@litespace/ui/Typography";
import { Animate } from "@/components/Common/Animate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import { useValidatePhone } from "@litespace/ui/hooks/validation";
import { PatternInput } from "@litespace/ui/PatternInput";

type EnterPhoneNumberProps = {
  phoneNumber: string | null;
  setPhoneNumber: (phone: string) => void;
  sendVerificationCode: Void;
  sending: boolean;
  close: Void;
};

export function EnterPhoneNumber({
  close,
  phoneNumber,
  sendVerificationCode,
  sending,
  setPhoneNumber,
}: EnterPhoneNumberProps) {
  const intl = useFormatMessage();
  const validatePhone = useValidatePhone();
  const form = useForm<{ phoneNumber: string | null }>({
    defaults: {
      phoneNumber: phoneNumber,
    },
    validate: { phoneNumber: validatePhone },
    onSubmit: (data) => {
      console.log({ phoneNumber });
      if (!data.phoneNumber || !validatePhone(data.phoneNumber)) return;

      sendVerificationCode();
    },
  });

  return (
    <Animate>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("notification-method.dialog.phone.description")}
      </Typography>
      <div className="mt-6 mb-12">
        <PatternInput
          mask=" "
          format="### #### ####"
          idleDir="rtl"
          label={intl("labels.phone")}
          state={form.errors.phoneNumber ? "error" : undefined}
          helper={form.errors.phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, "");
            setPhoneNumber(value);
            form.set("phoneNumber", value);
          }}
          value={form.state.phoneNumber}
          placeholder={intl(
            "notification-method.dialog.phone.input.placeholder"
          )}
        />
      </div>
      <div className="flex gap-6 mt-6 w-full">
        <Button
          onClick={form.submit}
          disabled={sending || !phoneNumber}
          loading={sending}
          size="large"
          className="grow"
        >
          {intl("notification-method.dialog.phone.send-code")}
        </Button>
        <Button
          disabled={sending}
          onClick={close}
          variant="secondary"
          size="large"
          className="grow"
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </Animate>
  );
}
