import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import React, { useMemo } from "react";
import { formatNumber } from "@/components/utils";
import { Button, ButtonSize } from "@/components/Button";

type Props = {
  /**
   * the title of the plan wheather
   *  - beginner
   *  - advanced
   *  - professional
   */
  title: string;
  /**
   * sammary about the plan
   */
  description: string;
  /**
   * number of minutes per week
   */
  weeklyMinutes: number;
  /**
   * price in egp (unscale)
   */
  price: number;
  label?: "most-common" | "most-valuable";
  primary?: boolean;
  /**
   * floating number between 0 and 100.
   */
  discount?: number;
  onBuy(): void;
};

export const PlanCard: React.FC<Props> = ({
  title,
  description,
  weeklyMinutes,
  price,
  label,
  primary,
  onBuy,
  discount,
}) => {
  const intl = useFormatMessage();
  const priceAfterDiscount = useMemo(
    () => (discount ? price - (price * discount) / 100 : price),
    [discount, price]
  );

  return (
    <div
      className={cn(
        "tw-relative tw-p-8 tw-border tw-shadow-plan-card tw-rounded-3xl",
        primary
          ? "tw-bg-brand-700 tw-border-brand-800"
          : "tw-bg-natural-50 tw-border-natural-200"
      )}
    >
      {label ? (
        <Typography
          element="body"
          weight="semibold"
          className={cn(
            "tw-absolute -tw-top-0 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-full",
            "tw-border-t tw-border-r tw-border-l tw-border-natural-300 tw-rounded-t-2xl tw-p-[10px] tw-shadow-plan-card-label -tw-z-10",
            { "tw-bg-natural-100 tw-text-brand-700": label === "most-common" },
            { "tw-bg-brand-700 tw-text-natural-50": label === "most-valuable" }
          )}
        >
          {label === "most-common" ? intl("plan.label.most-common") : null}
          {label === "most-valuable" ? intl("plan.label.most-valuable") : null}
        </Typography>
      ) : null}
      <div className="tw-flex tw-items-center tw-gap-4">
        <Typography
          element="subtitle-2"
          weight="bold"
          className={cn(
            "tw-mb-2",
            primary ? "tw-text-natural-50" : "tw-text-natural-950"
          )}
        >
          {title}
        </Typography>
        {discount ? (
          <div className="tw-self-stretch">
            <Typography
              element="tiny-text"
              weight="regular"
              className={cn(
                "tw-text-brand-700 tw-py-[2px] tw-px-3 tw-rounded-[30px]",
                primary ? "tw-bg-discount-primary" : "tw-bg-discount-default"
              )}
            >
              {intl("plan.discount", {
                value: formatNumber(discount, { maximumFractionDigits: 2 }),
              })}
            </Typography>
          </div>
        ) : null}
      </div>
      <Typography
        element="tiny-text"
        weight="semibold"
        className={cn(
          "tw-inline-block tw-mb-4",
          primary ? "tw-text-natural-100" : "tw-text-natural-700"
        )}
      >
        {description}
      </Typography>
      <Typography
        element="h4"
        weight="bold"
        className={cn(
          "tw-mb-2",
          primary ? "tw-text-natural-50" : "tw-text-brand-700"
        )}
      >
        {intl("plan.weekly-minutes", { value: formatNumber(weeklyMinutes) })}
      </Typography>
      <div className="tw-flex tw-items-end tw-flex-wrap">
        <Typography
          element="subtitle-1"
          weight="bold"
          className={cn(
            "tw-me-2",
            primary ? "tw-text-natural-50" : "tw-text-natural-950"
          )}
        >
          {intl("plan.price", {
            value: formatNumber(priceAfterDiscount, {
              maximumFractionDigits: 2,
            }),
          })}
        </Typography>
        {discount ? (
          <div className="tw-flex tw-gap-1">
            <Typography
              element="tiny-text"
              weight="regular"
              className={cn(
                primary ? "tw-text-natural-100" : "tw-text-natural-700"
              )}
            >
              {intl("plan.instead-of")}
            </Typography>
            <Typography
              element="tiny-text"
              weight="regular"
              className={cn(
                "tw-block tw-relative",
                primary ? "tw-text-destructive-400" : "tw-text-destructive-600"
              )}
            >
              {intl("plan.price-before-discount", {
                value: formatNumber(price, { maximumFractionDigits: 2 }),
              })}
              <span
                className={cn(
                  "tw-absolute tw-block tw-top-1/2 tw-right-0 tw-left-0 tw-border-t",
                  primary
                    ? "tw-border-destructive-400"
                    : "tw-border-destructive-600"
                )}
              />
            </Typography>
          </div>
        ) : null}
      </div>
      {primary ? (
        <button
          type="button"
          className={cn(
            "tw-w-full tw-py-3 tw-rounded-lg tw-mt-6",
            "tw-bg-natural-50 hover:tw-bg-brand-100 active:tw-bg-brand-200",
            "tw-transition-colors tw-duration-200"
          )}
          onClick={onBuy}
        >
          <Typography
            element="body"
            weight="semibold"
            className={cn(primary ? "tw-text-brand-700" : "tw-text-brand-50")}
          >
            {intl("plan.button.buy")}
          </Typography>
        </button>
      ) : (
        <Button
          htmlType="button"
          size={ButtonSize.Small}
          className="tw-mt-6 tw-w-full"
          onClick={onBuy}
        >
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-brand-50"
          >
            {intl("plan.button.buy")}
          </Typography>
        </Button>
      )}
    </div>
  );
};

export default PlanCard;
