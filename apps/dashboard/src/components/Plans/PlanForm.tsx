import { useCreatePlan, useUpdatePlan } from "@litespace/headless/plans";
import { formatCurrency } from "@litespace/ui/utils";
import { Button } from "@litespace/ui/Button";
import { Controller, Field, Form, Label } from "@litespace/ui/Form";
import {
  useValidateDiscount,
  useValidatePlanWeeklyMinutes,
  useValidatePrice,
} from "@litespace/ui/hooks/validation";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { Dialog } from "@litespace/ui/Dialog";
import { Duration } from "@litespace/utils/duration";
import { percentage, price } from "@litespace/utils/value";
import { IPlan, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  weeklyMinutes: Duration;
  baseMonthlyPrice: number; // scaled
  monthDiscount: number; // scaled
  quarterDiscount: number; // scaled
  yearDiscount: number; // scaled
  forInvitesOnly: boolean;
  active: boolean;
};

function formatPriceAfterDiscount(price: number, discount: number): string {
  if (discount < 0 || discount > 100) return "-";
  const afterDiscount = price - (price * discount) / 100;
  return formatCurrency(afterDiscount);
}

const PlanForm: React.FC<{
  open: boolean;
  close: Void;
  refresh: Void;
  plan?: IPlan.Self;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ open, plan, close, refresh, setOpen }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const form = useForm<IForm>({
    defaultValues: {
      weeklyMinutes: Duration.from(plan ? plan.weeklyMinutes.toString() : "0"),
      baseMonthlyPrice: plan ? price.unscale(plan.baseMonthlyPrice) : 0,
      monthDiscount: plan ? percentage.unscale(plan.monthDiscount) : 0,
      quarterDiscount: plan ? price.unscale(plan.quarterDiscount) : 0,
      yearDiscount: plan ? percentage.unscale(plan.yearDiscount) : 0,
      forInvitesOnly: plan ? plan.forInvitesOnly : false,
      active: plan ? plan.active : false,
    },
  });

  const onClose = useCallback(() => {
    form.reset();
    close();
  }, [close, form]);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl(
        plan
          ? "dashboard.plan.form.update.success"
          : "dashboard.plan.form.create.success"
      ),
    });
    refresh();
    onClose();
  }, [intl, onClose, plan, refresh, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl(
          plan
            ? "dashboard.plan.form.update.error"
            : "dashboard.plan.form.create.error"
        ),
        description: error.message,
      });
    },
    [intl, plan, toast]
  );

  const createPlan = useCreatePlan({ onSuccess, onError });
  const updatePlan = useUpdatePlan({ onSuccess, onError });
  const weeklyMinutesRules = useValidatePlanWeeklyMinutes();
  const priceRules = useValidatePrice();
  const discountRules = useValidateDiscount();

  const onSubmit = useCallback(
    (data: IForm) => {
      const payload = {
        active: data.active,
        weeklyMinutes: data.weeklyMinutes.minutes(),
        forInvitesOnly: data.forInvitesOnly,
        baseMonthlyPrice: price.scale(data.baseMonthlyPrice),
        monthDiscount: percentage.scale(data.monthDiscount),
        quarterDiscount: price.scale(data.quarterDiscount),
        yearDiscount: percentage.scale(data.yearDiscount),
      };
      if (plan) updatePlan.mutate({ id: plan.id, payload });
      else createPlan.mutate(payload);
    },
    [createPlan, plan, updatePlan]
  );

  return (
    <Dialog
      close={onClose}
      trigger={
        <Button size={"medium"}>{intl("dashboard.plans.createPlanBtn")}</Button>
      }
      title={intl("dashboard.plan.form.create")}
      open={open}
      setOpen={setOpen}
    >
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-96 max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
      >
        <div>
          <Field
            className="mb-1"
            label={<Label>{intl("dashboard.plan.weeklyMinutes")}</Label>}
            field={
              <Controller.Duration
                control={form.control}
                name="weeklyMinutes"
                value={form.watch("weeklyMinutes")}
                rules={weeklyMinutesRules}
              />
            }
          />
          <div className="flex justify-around gap-3 mb-1">
            <Field
              label={<Label>{intl("dashboard.plan.fullMonthPrice")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="baseMonthlyPrice"
                  value={form.watch("baseMonthlyPrice")}
                  allowNegative={false}
                  decimalScale={2}
                  prefix="EGP "
                  thousandSeparator=","
                  rules={priceRules}
                />
              }
            />
            <Field
              label={<Label>{intl("dashboard.plan.fullMonthDiscount")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="monthDiscount"
                  value={form.watch("monthDiscount")}
                  allowNegative={false}
                  decimalScale={2}
                  prefix={`(${formatPriceAfterDiscount(
                    form.watch("monthDiscount"),
                    form.watch("monthDiscount")
                  )}) % `}
                  rules={discountRules}
                />
              }
            />
          </div>
          <Field
            label={<Label>{intl("dashboard.plan.fullQuarterDiscount")}</Label>}
            field={
              <Controller.NumericInput
                control={form.control}
                name="quarterDiscount"
                value={form.watch("quarterDiscount")}
                allowNegative={false}
                decimalScale={2}
                prefix={`(${formatPriceAfterDiscount(
                  form.watch("quarterDiscount"),
                  form.watch("quarterDiscount")
                )}) % `}
                rules={discountRules}
              />
            }
          />
        </div>
        <div className="flex justify-around gap-3 mb-1">
          <Field
            label={<Label>{intl("dashboard.plan.halfYearDiscount")}</Label>}
            field={
              <Controller.NumericInput
                control={form.control}
                name="yearDiscount"
                value={form.watch("yearDiscount")}
                allowNegative={false}
                prefix={`(${formatPriceAfterDiscount(
                  form.watch("yearDiscount"),
                  form.watch("yearDiscount")
                )}) % `}
                max={100}
                decimalScale={2}
                rules={discountRules}
              />
            }
          />
        </div>
        <div className="flex justify-around gap-2 mt-3 mb-1">
          <Field
            variant="row"
            label={<Label>{intl("dashboard.plan.forInvitesOnly")}</Label>}
            field={
              <Controller.Switch control={form.control} name="forInvitesOnly" />
            }
          />
          <Field
            variant="row"
            label={<Label>{intl("dashboard.plan.active")}</Label>}
            field={<Controller.Switch control={form.control} name="active" />}
          />
        </div>

        <Button
          size={"medium"}
          loading={createPlan.isPending}
          disabled={createPlan.isPending}
          htmlType="submit"
        >
          {intl(plan ? "labels.update" : "labels.create")}
        </Button>
      </Form>
    </Dialog>
  );
};

export default PlanForm;
