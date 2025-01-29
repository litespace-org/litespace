import { useCreatePlan, useUpdatePlan } from "@litespace/headless/plans";
import { formatCurrency } from "@litespace/ui/utils";
import { Button, ButtonSize } from "@litespace/ui/Button";
import { Controller, Field, Form, Label } from "@litespace/ui/Form";
import {
  useValidateDiscount,
  useValidatePlanAlias,
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
  alias: string;
  weeklyMinutes: Duration;
  fullMonthPrice: number;
  fullMonthDiscount: number;
  fullQuarterPrice: number;
  fullQuarterDiscount: number;
  halfYearPrice: number;
  halfYearDiscount: number;
  fullYearPrice: number;
  fullYearDiscount: number;
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
  plan?: IPlan.MappedAttributes;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ open, plan, close, refresh, setOpen }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const form = useForm<IForm>({
    defaultValues: {
      alias: plan ? plan.alias : "",
      weeklyMinutes: Duration.from(plan ? plan.weeklyMinutes.toString() : "0"),
      fullMonthPrice: plan ? price.unscale(plan.fullMonthPrice) : 0,
      fullMonthDiscount: plan ? percentage.unscale(plan.fullMonthDiscount) : 0,
      fullQuarterPrice: plan ? price.unscale(plan.fullQuarterPrice) : 0,
      fullQuarterDiscount: plan
        ? percentage.unscale(plan.fullQuarterDiscount)
        : 0,
      halfYearPrice: plan ? price.unscale(plan.halfYearPrice) : 0,
      halfYearDiscount: plan ? percentage.unscale(plan.halfYearDiscount) : 0,
      fullYearPrice: plan ? price.unscale(plan.fullYearPrice) : 0,
      fullYearDiscount: plan ? percentage.unscale(plan.fullYearDiscount) : 0,
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
  const aliasRules = useValidatePlanAlias();
  const weeklyMinutesRules = useValidatePlanWeeklyMinutes();
  const priceRules = useValidatePrice();
  const discountRules = useValidateDiscount();

  const onSubmit = useCallback(
    (data: IForm) => {
      const payload = {
        alias: data.alias,
        active: data.active,
        weeklyMinutes: data.weeklyMinutes.minutes(),
        forInvitesOnly: data.forInvitesOnly,
        fullMonthPrice: price.scale(data.fullMonthPrice),
        fullMonthDiscount: percentage.scale(data.fullMonthDiscount),
        fullQuarterPrice: price.scale(data.fullQuarterPrice),
        fullQuarterDiscount: percentage.scale(data.fullQuarterDiscount),
        halfYearPrice: price.scale(data.halfYearPrice),
        halfYearDiscount: percentage.scale(data.halfYearDiscount),
        fullYearPrice: price.scale(data.fullYearPrice),
        fullYearDiscount: percentage.scale(data.fullYearDiscount),
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
        <Button size={ButtonSize.Small}>
          {intl("dashboard.plans.createPlanBtn")}
        </Button>
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
            label={<Label>{intl("dashboard.plan.title")}</Label>}
            field={
              <Controller.Input
                control={form.control}
                name="alias"
                value={form.watch("alias")}
                rules={aliasRules}
              />
            }
          />
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
                  name="fullMonthPrice"
                  value={form.watch("fullMonthPrice")}
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
                  name="fullMonthDiscount"
                  value={form.watch("fullMonthDiscount")}
                  allowNegative={false}
                  decimalScale={2}
                  prefix={`(${formatPriceAfterDiscount(
                    form.watch("fullMonthPrice"),
                    form.watch("fullMonthDiscount")
                  )}) % `}
                  rules={discountRules}
                />
              }
            />
          </div>
          <div className="flex justify-around gap-3 mb-1">
            <Field
              label={<Label>{intl("dashboard.plan.fullQuarterPrice")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="fullQuarterPrice"
                  value={form.watch("fullQuarterPrice")}
                  allowNegative={false}
                  thousandSeparator={","}
                  decimalScale={2}
                  prefix={"EGP "}
                  rules={priceRules}
                />
              }
            />
            <Field
              label={
                <Label>{intl("dashboard.plan.fullQuarterDiscount")}</Label>
              }
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="fullQuarterDiscount"
                  value={form.watch("fullQuarterDiscount")}
                  allowNegative={false}
                  decimalScale={2}
                  prefix={`(${formatPriceAfterDiscount(
                    form.watch("fullQuarterPrice"),
                    form.watch("fullQuarterDiscount")
                  )}) % `}
                  rules={discountRules}
                />
              }
            />
          </div>
          <div className="flex justify-around gap-3 mb-1">
            <Field
              label={<Label>{intl("dashboard.plan.halfYearPrice")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="halfYearPrice"
                  value={form.watch("halfYearPrice")}
                  allowNegative={false}
                  thousandSeparator=","
                  decimalScale={2}
                  prefix={"EGP "}
                  rules={priceRules}
                />
              }
            />
            <Field
              label={<Label>{intl("dashboard.plan.halfYearDiscount")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="halfYearDiscount"
                  value={form.watch("halfYearDiscount")}
                  allowNegative={false}
                  prefix={`(${formatPriceAfterDiscount(
                    form.watch("halfYearPrice"),
                    form.watch("halfYearDiscount")
                  )}) % `}
                  max={100}
                  decimalScale={2}
                  rules={discountRules}
                />
              }
            />
          </div>
          <div className="flex justify-around gap-3 mb-1">
            <Field
              label={<Label>{intl("dashboard.plan.fullYearPrice")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="fullYearPrice"
                  value={form.watch("fullYearPrice")}
                  allowNegative={false}
                  prefix="EGP "
                  thousandSeparator=","
                  decimalScale={2}
                  rules={priceRules}
                />
              }
            />
            <Field
              label={<Label>{intl("dashboard.plan.fullYearDiscount")}</Label>}
              field={
                <Controller.NumericInput
                  control={form.control}
                  name="fullYearDiscount"
                  value={form.watch("fullYearDiscount")}
                  prefix={`(${formatPriceAfterDiscount(
                    form.watch("fullYearPrice"),
                    form.watch("fullYearDiscount")
                  )}) % `}
                  max={100}
                  decimalScale={2}
                  allowNegative={false}
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
                <Controller.Switch
                  control={form.control}
                  name="forInvitesOnly"
                />
              }
            />
            <Field
              variant="row"
              label={<Label>{intl("dashboard.plan.active")}</Label>}
              field={<Controller.Switch control={form.control} name="active" />}
            />
          </div>

          <Button
            size={ButtonSize.Small}
            loading={createPlan.isPending}
            disabled={createPlan.isPending}
            htmlType="submit"
          >
            {intl(plan ? "labels.update" : "labels.create")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default PlanForm;
