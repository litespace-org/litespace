import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import React, { useMemo } from "react";
import { formatNumber } from "@/components/utils";
import { Button } from "@/components/Button";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  discount,
  onBuy,
}) => {
  const mq = useMediaQuery();
  const intl = useFormatMessage();
  const priceAfterDiscount = useMemo(
    () => (discount ? price - (price * discount) / 100 : price),
    [discount, price]
  );

  return (
    <div
      className={cn(
        "relative p-4 md:p-8 border shadow-plan-card rounded-lg md:rounded-3xl",
        primary
          ? "bg-brand-700 border-brand-800"
          : "bg-natural-50 border-natural-200"
      )}
    >
      {label ? (
        <Typography
          tag="span"
          className={cn(
            "text-tiny lg:text-body font-regular lg:font-semibold",
            "absolute top-0 left-[34px] md:left-1/2 md:-translate-x-1/2 -translate-y-full",
            "border-t border-r border-l border-natural-300 rounded-t-lg md:rounded-t-2xl py-[7px] px-[8px] md:p-[10px] shadow-plan-card-label -z-10",
            { "bg-natural-100 text-brand-700": label === "most-common" },
            { "bg-brand-700 text-natural-50": label === "most-valuable" },
            { "inline-block": !mq.lg }
          )}
        >
          {label === "most-common" ? intl("plan.label.most-common") : null}
          {label === "most-valuable" ? intl("plan.label.most-valuable") : null}
        </Typography>
      ) : null}
      <div>
        <div className="flex items-center gap-4 mb-1 md:mb-2">
          <Typography
            tag="h2"
            className={cn(
              "text-caption lg:text-subtitle-2 font-bold",
              primary ? "text-natural-50" : "text-natural-950"
            )}
          >
            {title}
          </Typography>
          {discount ? (
            <div className="self-stretch">
              <Typography
                tag="span"
                className={cn(
                  "text-brand-700 py-[2px] px-3 rounded-[30px] text-tiny font-regular",
                  primary ? "bg-discount-primary" : "bg-discount-default"
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
          tag="p"
          className={cn(
            "inline-block mb-2 md:mb-4 text-tiny font-regular lg:font-semibold",
            primary ? "text-natural-100" : "text-natural-700"
          )}
        >
          {description}
        </Typography>
      </div>

      <div className={cn("flex flex-col")}>
        <Typography
          tag="span"
          className={cn(
            "font-bold text-body lg:text-h4",
            mq.lg ? "mb-2" : "mb-1",
            primary ? "text-natural-50" : "text-brand-700"
          )}
        >
          {intl("plan.weekly-minutes", {
            value: formatNumber(weeklyMinutes),
          })}
        </Typography>
        <div className={cn("flex items-end flex-wrap")}>
          <Typography
            tag="span"
            className={cn(
              "text-caption lg:text-subtitle-2 font-semibold lg:font-bold",
              primary ? "text-natural-50" : "text-natural-950"
            )}
          >
            {intl("plan.price", {
              value: formatNumber(priceAfterDiscount, {
                maximumFractionDigits: 2,
              }),
            })}
          </Typography>
          {discount ? (
            <div className="flex gap-1">
              <Typography
                tag="span"
                className={cn(
                  "text-tiny font-regular",
                  primary ? "text-natural-100" : "text-natural-700"
                )}
              >
                {intl("plan.instead-of")}
              </Typography>
              <Typography
                tag="span"
                className={cn(
                  "block relative text-tiny font-regular",
                  primary ? "text-destructive-400" : "text-destructive-600"
                )}
              >
                {intl("plan.price-before-discount", {
                  value: formatNumber(price, { maximumFractionDigits: 2 }),
                })}
                <span
                  className={cn(
                    "absolute block top-1/2 right-0 left-0 border-t",
                    primary
                      ? "border-destructive-400"
                      : "border-destructive-600"
                  )}
                />
              </Typography>
            </div>
          ) : null}
        </div>
      </div>

      {primary ? (
        <button
          type="button"
          className={cn(
            "w-full h-7 lg:h-10 rounded-lg mt-4 md:mt-6",
            "bg-natural-50 hover:bg-brand-100 active:bg-brand-200",
            "transition-colors duration-200"
          )}
          onClick={onBuy}
        >
          <Typography
            tag="span"
            className={cn(
              "font-semibold text-caption lg-body",
              primary ? "text-brand-700" : "text-brand-50"
            )}
          >
            {intl("plan.button.buy")}
          </Typography>
        </button>
      ) : (
        <Button
          htmlType="button"
          size={mq.lg ? "large" : "medium"}
          className="mt-4 md:mt-6 w-full"
          onClick={onBuy}
        >
          <Typography
            tag="span"
            className="text-brand-50 font-semibold text-caption lg:text-body"
          >
            {intl("plan.button.buy")}
          </Typography>
        </Button>
      )}
    </div>
  );
};

export default PlanCard;
