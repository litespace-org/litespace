import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { PatternInput } from "@litespace/ui/PatternInput";
import { validatePhone } from "@litespace/ui/lib/validate";
import React from "react";

type Props = {
  setPhone: (phone: string) => void;
  close: Void;
};

type Form = { phone: string };

export const PhoneNumber: React.FC<Props> = ({ close, setPhone }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: validatePhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: "",
    },
    validators,
    onSubmit: (data) => {
      setPhone(data.phone);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("verify-phone-dialog.empty-phone.description")}
      </Typography>
      <form onSubmit={form.onSubmit} className="flex flex-col gap-6">
        <PatternInput
          id="phone"
          mask=" "
          format="### #### ####"
          idleDir="ltr"
          label={intl("labels.phone")}
          state={form.errors.phone ? "error" : undefined}
          helper={form.errors.phone}
          autoComplete="true"
          onValueChange={({ value }) => {
            form.set("phone", value);
          }}
          value={form.state.phone}
          placeholder={intl("labels.phone.placeholder")}
        />

        <div className="flex gap-6 w-full">
          <Button
            disabled={!form.state.phone}
            size="large"
            className="flex-1 font-medium"
            htmlType="submit"
          >
            {intl("labels.next")}
          </Button>
          <Button
            onClick={close}
            variant="secondary"
            size="large"
            className="flex-1 font-medium"
            htmlType="button"
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PhoneNumber;
