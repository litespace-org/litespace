import { useCreatePlan, useUpdatePlan } from "@litespace/headless/plans";
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
  validatePlanPrice,
  validatePlanWeeklyMinutes,
  validatePlanDiscount,
} from "@litespace/ui/lib/validate";
import { NumericInput } from "@litespace/ui/NumericInput";
import { Typography } from "@litespace/ui/Typography";
import { formatMinutes, formatNumber } from "@litespace/ui/utils";
import {
  optional,
  percentage,
  PLAN_PERIOD_LITERAL_TO_MONTH_COUNT,
  price,
} from "@litespace/utils";
import { flow } from "lodash";
import Edit from "@litespace/assets/Edit";

type Form = {
  weeklyMinutes: number;
  baseMonthlyPrice: number; // scaled
  monthDiscount: number; // scaled
  quarterDiscount: number; // scaled
  yearDiscount: number; // scaled
};

function calcPriceAfterDiscount(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

/**
 * This component can create plans from scratch and can edit the plans,
 * It determines its behavior by the plan prop, if it's there then it will edit the current plan
 * otherwise create new one
 *
 * @NOTE be careful about scaling and unscaling:
 *  - we show data as unscaled numbers
 *  - we send the data as scaled numbers
 */
const ManagePlan: React.FC<{
  open: boolean;
  refetch: Void;
  close: Void;
  plan: IPlan.Self | null;
}> = ({ open, refetch, close, plan }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  // ============ form ==================
  const validators = useMakeValidators<Form>({
    weeklyMinutes: {
      required: true,
      validate: validatePlanWeeklyMinutes,
    },
    baseMonthlyPrice: {
      required: true,
      validate: flow(price.scale, validatePlanPrice),
    },
    monthDiscount: {
      validate: flow(percentage.scale, validatePlanDiscount),
    },
    quarterDiscount: {
      validate: flow(percentage.scale, validatePlanDiscount),
    },
    yearDiscount: {
      validate: flow(percentage.scale, validatePlanDiscount),
    },
  });

  const form = useForm<Form>({
    defaults: {
      weeklyMinutes: plan?.weeklyMinutes || 0,
      baseMonthlyPrice: price.unscale(plan?.baseMonthlyPrice || 0),
      monthDiscount: percentage.unscale(plan?.monthDiscount || 0),
      quarterDiscount: percentage.unscale(plan?.quarterDiscount || 0),
      yearDiscount: percentage.unscale(plan?.yearDiscount || 0),
    },
    validators,
    onSubmit(data) {
      if (plan)
        return updatePlan.mutate({
          id: plan.id,
          payload: {
            weeklyMinutes: data.weeklyMinutes,
            baseMonthlyPrice: price.scale(data.baseMonthlyPrice), // scaled
            monthDiscount: percentage.scale(data.monthDiscount), // scaled
            quarterDiscount: percentage.scale(data.quarterDiscount), // scaled
            yearDiscount: percentage.scale(data.yearDiscount),
          },
        });

      createPlan.mutate({
        weeklyMinutes: data.weeklyMinutes,
        baseMonthlyPrice: price.scale(data.baseMonthlyPrice), // scaled
        monthDiscount: percentage.scale(data.monthDiscount), // scaled
        quarterDiscount: percentage.scale(data.quarterDiscount), // scaled
        yearDiscount: percentage.scale(data.yearDiscount),
        active: false,
        forInvitesOnly: false,
      });
    },
  });

  // ============ Create Mutation ==================
  const onCreateSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.plan.form.create.success"),
    });
    refetch();
    close();
  }, [intl, close, refetch, toast]);

  const onCreateError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plan.form.create.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const createPlan = useCreatePlan({
    onSuccess: onCreateSuccess,
    onError: onCreateError,
  });

  // ============ Update Plan Mutation ==================
  const onUpdateSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.plan.form.edit.success"),
    });
    refetch();
    close();
  }, [refetch, close, intl, toast]);

  const onUpdateError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plans.update-error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const updatePlan = useUpdatePlan({
    onSuccess: onUpdateSuccess,
    onError: onUpdateError,
  });

  // ============ Dialog Title ==================
  const Title = useMemo(() => {
    if (plan)
      return (
        <div className="flex gap-2 items-center">
          <Edit className="w-6 h-6 [&>*]:stroke-natural-950" />
          <Typography tag="span" className="text-subtitle-2 font-bold">
            {intl("dashboard.plans.edit.title")}
          </Typography>
        </div>
      );

    return (
      <div className="flex gap-2 items-center">
        <AddCircle className="w-6 h-6 [&>*]:stroke-natural-950" />
        <Typography tag="span" className="text-subtitle-2 font-bold">
          {intl("dashboard.plans.create.title")}
        </Typography>
      </div>
    );
  }, [plan, intl]);

  // ============ Label Helpers ==================
  const formatDisountHelper = useCallback(
    (disount: number, period: IPlan.PeriodLiteral) => {
      const before =
        form.state.baseMonthlyPrice *
        PLAN_PERIOD_LITERAL_TO_MONTH_COUNT[period];

      const after = calcPriceAfterDiscount(
        form.state.baseMonthlyPrice *
          PLAN_PERIOD_LITERAL_TO_MONTH_COUNT[period],
        disount
      );
      return intl("dashboard.plans.create.discount-helper", {
        before: formatNumber(before),
        after: formatNumber(after),
        diff: formatNumber(before - after),
      });
    },
    [form.state.baseMonthlyPrice, intl]
  );

  const weeklyMinutesHelper = useMemo(() => {
    if (form.errors.weeklyMinutes) return form.errors.weeklyMinutes;
    if (form.state.weeklyMinutes)
      return formatMinutes(form.state.weeklyMinutes);
  }, [form.errors.weeklyMinutes, form.state.weeklyMinutes]);

  const monthHelper = useMemo(() => {
    if (form.errors.monthDiscount) return form.errors.monthDiscount;
    if (!form.state.baseMonthlyPrice) return;
    return formatDisountHelper(form.state.monthDiscount, "month");
  }, [
    form.errors.monthDiscount,
    form.state.baseMonthlyPrice,
    form.state.monthDiscount,
    formatDisountHelper,
  ]);

  const quarterHelper = useMemo(() => {
    if (form.errors.quarterDiscount) return form.errors.quarterDiscount;
    if (!form.state.baseMonthlyPrice) return;
    return formatDisountHelper(form.state.quarterDiscount, "quarter");
  }, [
    form.errors.quarterDiscount,
    form.state.baseMonthlyPrice,
    form.state.quarterDiscount,
    formatDisountHelper,
  ]);

  const yearHelper = useMemo(() => {
    if (form.errors.yearDiscount) return form.errors.yearDiscount;
    if (!form.state.baseMonthlyPrice) return;
    return formatDisountHelper(form.state.yearDiscount, "year");
  }, [
    form.errors.yearDiscount,
    form.state.baseMonthlyPrice,
    form.state.yearDiscount,
    formatDisountHelper,
  ]);

  return (
    <Dialog open={open} close={close} title={Title} className="w-[512px]">
      <form onSubmit={form.onSubmit}>
        <div className="py-6 flex flex-col gap-4">
          <NumericInput
            id="weekly-minutes"
            label={intl("dashboard.plans.create.weekly-minutes.label")}
            placeholder={intl(
              "dashboard.plans.create.weekly-minutes.placeholder"
            )}
            onValueChange={({ floatValue }) => {
              form.set("weeklyMinutes", floatValue || 0);
            }}
            value={optional(form.state.weeklyMinutes)}
            autoComplete="off"
            state={form.errors.weeklyMinutes ? "error" : undefined}
            helper={weeklyMinutesHelper}
            thousandSeparator=","
            decimalScale={0}
            allowNegative={false}
          />
          <NumericInput
            id="month-price"
            label={intl("dashboard.plans.create.base-month-price.label")}
            placeholder={intl(
              "dashboard.plans.create.base-month-price.placeholder"
            )}
            onValueChange={({ floatValue }) =>
              form.set("baseMonthlyPrice", floatValue || 0)
            }
            value={optional(form.state.baseMonthlyPrice)}
            state={form.errors.baseMonthlyPrice ? "error" : undefined}
            helper={form.errors.baseMonthlyPrice}
            allowNegative={false}
            decimalScale={2}
            thousandSeparator=","
            autoComplete="off"
          />
          <NumericInput
            id="month-discount"
            label={intl("dashboard.plans.create.month-discount")}
            placeholder={intl("labels.percent.placeholder")}
            onValueChange={({ floatValue }) =>
              form.set("monthDiscount", floatValue || 0)
            }
            value={optional(form.state.monthDiscount)}
            autoComplete="off"
            state={form.errors.monthDiscount ? "error" : undefined}
            helper={monthHelper}
            allowNegative={false}
            decimalScale={2}
            prefix="%"
          />
          <NumericInput
            id="quarter-discount"
            label={intl("dashboard.plans.create.quarter-discount")}
            placeholder={intl("labels.percent.placeholder")}
            onValueChange={({ floatValue }) =>
              form.set("quarterDiscount", floatValue || 0)
            }
            value={optional(form.state.quarterDiscount)}
            state={form.errors.quarterDiscount ? "error" : undefined}
            helper={quarterHelper}
            allowNegative={false}
            autoComplete="off"
            prefix="%"
          />
          <NumericInput
            id="year-discount"
            label={intl("dashboard.plans.create.year-discount")}
            placeholder={intl("labels.percent.placeholder")}
            onValueChange={({ floatValue }) =>
              form.set("yearDiscount", floatValue || 0)
            }
            value={optional(form.state.yearDiscount)}
            state={form.errors.yearDiscount ? "error" : undefined}
            helper={yearHelper}
            allowNegative={false}
            autoComplete="off"
            prefix="%"
          />
        </div>
        <div className="flex gap-6">
          <Button
            size="large"
            loading={createPlan.isPending || updatePlan.isPending}
            disabled={createPlan.isPending || updatePlan.isPending}
            htmlType="submit"
            className="flex-1"
          >
            {intl(
              plan
                ? "dashboard.plans.edit.submit"
                : "dashboard.plans.create.submit"
            )}
          </Button>
          <Button
            size="large"
            variant="secondary"
            disabled={createPlan.isPending || updatePlan.isPending}
            className="flex-1"
            onClick={close}
            htmlType="button"
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ManagePlan;
