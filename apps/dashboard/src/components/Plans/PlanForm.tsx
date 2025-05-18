import { useCreatePlan } from "@litespace/headless/plans";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { IPlan, Void } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import AddCircle from "@litespace/assets/AddCircle";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import {
  isValidPlanDiscount,
  isValidPlanWeeklyMinutes,
  isValidPrice,
} from "@litespace/ui/lib/validate";
import { NumericInput } from "@litespace/ui/NumericInput";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import {
  MAX_DISCOUNT_VALUE,
  MIN_DISCOUNT_VALUE,
  MINUTES_IN_WEEK,
  MONTHS_IN_QUARTER,
  MONTHS_IN_YEAR,
  percentage,
  price,
} from "@litespace/utils";

type IForm = {
  weeklyMinutes: number;
  baseMonthlyPrice: number; // scaled
  monthDiscount: number; // scaled
  quarterDiscount: number; // scaled
  yearDiscount: number; // scaled
};

function calcPriceAfterDiscount(
  price: number,
  discount: number
): number | null {
  if (discount < 0 || discount > 100) return null;
  const afterDiscount = price - (price * discount) / 100;
  return afterDiscount;
}

const PlanForm: React.FC<{
  open: boolean;
  refetch: Void;
  close: Void;
}> = ({ open, refetch, close }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const validators = useMakeValidators<IForm>({
    weeklyMinutes: {
      required: true,
      validate: isValidPlanWeeklyMinutes,
    },
    baseMonthlyPrice: {
      required: true,
      validate: isValidPrice,
    },
    monthDiscount: {
      validate: isValidPlanDiscount,
    },
    quarterDiscount: {
      validate: isValidPlanDiscount,
    },
    yearDiscount: {
      validate: isValidPlanDiscount,
    },
  });

  const form = useForm<IForm>({
    defaults: {
      weeklyMinutes: 0,
      baseMonthlyPrice: 0,
      monthDiscount: 0,
      quarterDiscount: 0,
      yearDiscount: 0,
    },
    validators,
    onSubmit(data) {
      const payload: IPlan.CreatePayload = {
        weeklyMinutes: data.weeklyMinutes,
        baseMonthlyPrice: price.scale(data.baseMonthlyPrice), // scaled
        monthDiscount: percentage.scale(data.monthDiscount), // scaled
        quarterDiscount: percentage.scale(data.quarterDiscount), // scaled
        yearDiscount: percentage.scale(data.yearDiscount),
        active: false,
        forInvitesOnly: false,
      };
      createPlan.mutate(payload);
    },
  });

  const onClose = useCallback(() => {
    form.reset();
    close();
  }, [close, form]);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.plan.form.create.success"),
    });
    refetch();
    onClose();
  }, [intl, onClose, refetch, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plan.form.create.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const createPlan = useCreatePlan({ onSuccess, onError });

  const monthHelperText = useMemo(() => {
    const priceAfterdiscount = calcPriceAfterDiscount(
      form.state.baseMonthlyPrice,
      form.state.monthDiscount
    );
    if (!priceAfterdiscount) return;
    if (form.state.baseMonthlyPrice && form.state.monthDiscount)
      return intl("dashboard.plan.price-after-discount", {
        value: formatNumber(priceAfterdiscount),
      });
  }, [form.state.baseMonthlyPrice, form.state.monthDiscount, intl]);

  const quarterHelperText = useMemo(() => {
    const totalPrice = form.state.baseMonthlyPrice * MONTHS_IN_QUARTER;
    const priceAfterdiscount = calcPriceAfterDiscount(
      totalPrice,
      form.state.quarterDiscount
    );
    const monthPriceAfterDiscount = priceAfterdiscount
      ? priceAfterdiscount / MONTHS_IN_QUARTER
      : null;
    if (!monthPriceAfterDiscount) return;
    if (form.state.baseMonthlyPrice && form.state.quarterDiscount)
      return intl("dashboard.plan.price-after-discount", {
        value: formatNumber(monthPriceAfterDiscount),
      });
  }, [form.state.baseMonthlyPrice, form.state.quarterDiscount, intl]);

  const yearHelperText = useMemo(() => {
    const totalPrice = form.state.baseMonthlyPrice * MONTHS_IN_YEAR;
    const priceAfterDiscount = calcPriceAfterDiscount(
      totalPrice,
      form.state.yearDiscount
    );
    const monthPriceAfterDiscount = priceAfterDiscount
      ? priceAfterDiscount / MONTHS_IN_YEAR
      : null;
    if (!monthPriceAfterDiscount) return;
    if (form.state.baseMonthlyPrice && form.state.yearDiscount)
      return intl("dashboard.plan.price-after-discount", {
        value: formatNumber(monthPriceAfterDiscount),
      });
  }, [form.state.baseMonthlyPrice, form.state.yearDiscount, intl]);

  return (
    <Dialog
      open={open}
      close={onClose}
      title={
        <div className="flex gap-2 items-center">
          <AddCircle className="w-6 h-6 [&>*]:stroke-natural-950" />
          <Typography tag="span" className="text-subtitle-2 font-bold">
            {intl("dashboard.plans.create-plan.title")}
          </Typography>
        </div>
      }
      className="focus-visible:outline-none"
    >
      <form onSubmit={form.onSubmit} className="min-w-[512px]">
        <div className="py-6 flex flex-col gap-4">
          <NumericInput
            label={intl("dashboard.plan.weekly-minutes.label")}
            placeholder={intl("dashboard.plan.weekly-minutes.placeholder")}
            onValueChange={({ value }) =>
              form.set("weeklyMinutes", parseInt(value))
            }
            value={form.state.weeklyMinutes}
            autoComplete="off"
            dir="rtl"
            state={form.errors.weeklyMinutes ? "error" : undefined}
            helper={form.errors.weeklyMinutes}
            thousandSeparator=","
            decimalScale={0}
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return floatValue < MINUTES_IN_WEEK && floatValue > 0;
            }}
          />
          <NumericInput
            label={intl("dashboard.plan.full-month-price")}
            placeholder={intl("dashboard.plan.full-month-price.placeholder")}
            onValueChange={({ value }) =>
              form.set("baseMonthlyPrice", parseInt(value))
            }
            value={form.state.baseMonthlyPrice}
            autoComplete="off"
            dir="rtl"
            state={form.errors.baseMonthlyPrice ? "error" : undefined}
            helper={form.errors.baseMonthlyPrice}
            allowNegative={false}
            decimalScale={2}
            thousandSeparator=","
          />
          <NumericInput
            label={intl("dashboard.plan.full-month-discount")}
            placeholder={intl("placeholder.percent")}
            onChange={(e) =>
              form.set(
                "monthDiscount",
                parseInt(e.target.value.replace("%", ""))
              )
            }
            value={form.state.monthDiscount}
            autoComplete="off"
            dir="rtl"
            state={form.errors.monthDiscount ? "error" : undefined}
            helper={form.errors.monthDiscount || monthHelperText}
            prefix="%"
            decimalScale={2}
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return (
                floatValue < MAX_DISCOUNT_VALUE &&
                floatValue >= MIN_DISCOUNT_VALUE
              );
            }}
          />
          <NumericInput
            label={intl("dashboard.plan.full-quarter-discount")}
            placeholder={intl("placeholder.percent")}
            onChange={(e) =>
              form.set(
                "quarterDiscount",
                parseInt(e.target.value.replace("%", ""))
              )
            }
            value={form.state.quarterDiscount}
            autoComplete="off"
            dir="rtl"
            state={form.errors.quarterDiscount ? "error" : undefined}
            helper={form.errors.quarterDiscount || quarterHelperText}
            prefix="%"
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return (
                floatValue < MAX_DISCOUNT_VALUE &&
                floatValue >= MIN_DISCOUNT_VALUE
              );
            }}
          />
          <NumericInput
            label={intl("dashboard.plan.full-year-discount")}
            placeholder={intl("placeholder.percent")}
            onChange={(e) =>
              form.set(
                "yearDiscount",
                parseInt(e.target.value.replace("%", ""))
              )
            }
            value={form.state.yearDiscount}
            autoComplete="off"
            dir="rtl"
            state={form.errors.yearDiscount ? "error" : undefined}
            helper={form.errors.yearDiscount || yearHelperText}
            prefix="%"
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return (
                floatValue < MAX_DISCOUNT_VALUE &&
                floatValue >= MIN_DISCOUNT_VALUE
              );
            }}
          />
        </div>
        <div className="flex gap-6">
          <Button
            size="large"
            loading={createPlan.isPending}
            disabled={createPlan.isPending}
            htmlType="submit"
            className="flex-1"
          >
            {intl("dashboard.plans.create-plan.btn")}
          </Button>
          <Button
            size="large"
            variant="secondary"
            disabled={createPlan.isPending}
            className="flex-1"
            onClick={onClose}
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default PlanForm;
