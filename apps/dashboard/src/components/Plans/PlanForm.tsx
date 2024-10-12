import { useCreatePlan } from "@litespace/headless/plans";
import {
  Button,
  ButtonSize,
  Controller,
  Dialog,
  Field,
  Form,
  formatCurrency,
  Label,
  toaster,
  useFormatMessage,
  useValidateDiscount,
  useValidatePlanAlias,
  useValidatePlanWeeklyMinutes,
  useValidatePrice,
} from "@litespace/luna";
import { percentage, price } from "@litespace/sol";
import { IPlan, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  alias: string;
  weeklyMinutes: number;
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
}> = ({ open, close, refresh, plan }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      alias: plan ? plan.alias : "",
      weeklyMinutes: plan ? plan.weeklyMinutes : 0,
      fullMonthPrice: plan ? plan.fullMonthPrice : 0,
      fullMonthDiscount: plan ? plan.fullMonthDiscount : 0,
      fullQuarterPrice: plan ? plan.fullQuarterPrice : 0,
      fullQuarterDiscount: plan ? plan.fullQuarterDiscount : 0,
      halfYearPrice: plan ? plan.halfYearPrice : 0,
      halfYearDiscount: plan ? plan.halfYearDiscount : 0,
      fullYearPrice: plan ? plan.fullYearPrice : 0,
      fullYearDiscount: plan ? plan.fullYearDiscount : 0,
      forInvitesOnly: plan ? plan.forInvitesOnly : false,
      active: plan ? plan.active : false,
    },
  });

  const onClose = useCallback(() => {
    form.reset();
    close();
  }, [close, form]);

  const onSuccess = useCallback(() => {
    toaster.success({ title: intl("dashboard.plan.form.create.success") });
    refresh();
    onClose();
  }, [intl, onClose, refresh]);

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("dashboard.plan.form.create.error"),
        description: error.message,
      });
    },
    [intl]
  );

  const createPlan = useCreatePlan({ onSuccess, onError });
  // TODO: const updatePlan = useUpdatePlan({ onSuccess, onError })
  const aliasRules = useValidatePlanAlias();
  const weeklyMinutesRules = useValidatePlanWeeklyMinutes();
  const priceRules = useValidatePrice();
  const discountRules = useValidateDiscount();

  const onSubmit = useCallback(
    (data: IForm) => {
      createPlan.mutate({
        alias: data.alias,
        active: data.active,
        weeklyMinutes: data.weeklyMinutes,
        forInvitesOnly: data.forInvitesOnly,
        fullMonthPrice: price.scale(data.fullMonthPrice),
        fullMonthDiscount: percentage.scale(data.fullMonthDiscount),
        fullQuarterPrice: price.scale(data.fullQuarterPrice),
        fullQuarterDiscount: percentage.scale(data.fullQuarterDiscount),
        halfYearPrice: price.scale(data.halfYearPrice),
        halfYearDiscount: percentage.scale(data.halfYearDiscount),
        fullYearPrice: price.scale(data.fullYearPrice),
        fullYearDiscount: percentage.scale(data.fullYearDiscount),
      });
      form.reset();
    },
    [createPlan, form]
  );

  return (
    <Dialog
      open={open}
      title={intl("dashboard.plan.form.create")}
      close={onClose}
    >
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-96 max-h-[32rem]  overflow-y-auto scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
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
              <Controller.NumericInput
                control={form.control}
                name="weeklyMinutes"
                value={form.watch("weeklyMinutes")}
                allowNegative={false}
                decimalScale={0}
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
          <div className="flex justify-around gap-2 mb-1 mt-3">
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
            {intl("labels.create")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default PlanForm;
