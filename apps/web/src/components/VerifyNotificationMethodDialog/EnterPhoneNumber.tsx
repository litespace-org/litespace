import { Typography } from "@litespace/ui/Typography";
import { Animate } from "@/components/Common/Animate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { PatternInput } from "@litespace/ui/PatternInput";
import { validatePhone } from "@litespace/ui/lib/validate";

type Props = {
  phone: string | null;
  setPhone: (phone: string) => void;
  loading: boolean;
  close: Void;
};

type Form = { phone: string };

export const EnterPhoneNumber: React.FC<Props> = ({
  close,
  phone,
  loading,
  setPhone,
}) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: validatePhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: phone || "",
    },
    validators,
    onSubmit: (data) => {
      setPhone(data.phone);
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
          id="phone"
          mask=" "
          format="### #### ####"
          idleDir="ltr"
          label={intl("labels.phone")}
          state={form.errors.phone ? "error" : undefined}
          helper={form.errors.phone}
          autoComplete="off"
          onValueChange={({ value }) => {
            form.set("phone", value);
          }}
          value={form.state.phone}
          placeholder={intl(
            "notification-method.dialog.phone.input-placeholder"
          )}
        />
      </div>
      <div className="flex gap-6 mt-6 w-full">
        <Button
          onClick={form.submit}
          disabled={loading}
          loading={loading}
          size="large"
          className="grow"
        >
          {intl("notification-method.dialog.phone.send-code")}
        </Button>
        <Button
          disabled={loading}
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
};
