import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@litespace/ui/Button";
import AddCard from "@litespace/assets/AddCard";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Controller, Form } from "@litespace/ui/Form";
import {
  useValidatePhone,
  useValidateCVV,
} from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";

type IForm = {
  card: string;
  phone: string;
  cvv: number;
};

const PaymentForm: React.FC = () => {
  const intl = useFormatMessage();

  const { control, handleSubmit, watch, formState } = useForm<IForm>({
    defaultValues: {
      card: "",
      phone: "",
      cvv: undefined,
    },
  });

  const card = watch("card");
  const phone = watch("phone");
  const cvv = watch("cvv");
  const errors = formState.errors;

  const validatePhone = useValidatePhone(true);
  const validateCVV = useValidateCVV(true);

  const onSubmit = useCallback((data: IForm) => console.log(data), []);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Typography tag="p" className={"text-body font-medium"}>
          {intl("page.checkout.payment.description")}
        </Typography>

        <div className="flex flex-col gap-1">
          <Typography tag="label" className="text-caption font-semibold">
            {intl("page.checkout.payment.card-number")}
          </Typography>
          <div className="flex flex-row items-center gap-4">
            <Controller.Select
              id="card"
              name="card"
              className="flex-1"
              value={card}
              control={control}
              options={[]}
              placeholder={intl(
                "page.checkout.payment.card-number-placeholder"
              )}
              helper={errors.card?.message}
            />
            <Button
              type="main"
              variant="tertiary"
              size="large"
              htmlType="submit"
              className="!font-medium"
              startIcon={<AddCard />}
              disabled={false}
              loading={false}
            >
              {intl("page.checkout.payment.add-card")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Controller.Input
            id="cvv"
            control={control}
            dir="rtl"
            inputSize="large"
            name="cvv"
            value={cvv}
            label={intl("page.checkout.payment.cvv-label")}
            rules={{ validate: validateCVV }}
            placeholder={intl("page.checkout.payment.cvv")}
            state={errors.phone ? "error" : undefined}
            helper={errors.cvv?.message}
            autoComplete="off"
          />
          <Controller.PatternInput
            mask=" "
            id="phone"
            control={control}
            idleDir="rtl"
            inputSize="large"
            name="phone"
            value={phone}
            format="### #### ####"
            label={intl("page.checkout.payment.phone-number")}
            rules={{ validate: validatePhone }}
            placeholder={intl("page.checkout.payment.phone-number-placeholder")}
            state={errors.phone ? "error" : undefined}
            helper={errors.phone?.message}
            autoComplete="off"
          />
        </div>
      </div>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        className="w-full"
        disabled={false}
        loading={false}
      >
        {intl("page.checkout.payment.confirm-button")}
      </Button>

      <Typography tag="p" className="text-tiny font-normal">
        {intl("page.checkout.payment.confirmation-code-note")}
      </Typography>
    </Form>
  );
};

export default PaymentForm;
