import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@/hooks/intl";
import cn from "classnames";
import React, { useMemo } from "react";
import { formatNumber } from "@litespace/ui/utils";
import { Button } from "@litespace/ui/Button";
import Link from "next/link";
import { PlanCardProps } from "@/types/plans";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { IUser } from "@litespace/types";

export const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  weeklyMinutes,
  price,
  label,
  primary,
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
            "text-tiny lg:text-body lg:font-semibold",
            "absolute top-0 left-[34px] md:left-1/2 md:-translate-x-1/2 -translate-y-full",
            "border-t border-r border-l border-natural-300 rounded-t-lg md:rounded-t-2xl py-[7px] px-[8px] md:p-[10px] shadow-plan-card-label -z-10 inline-block",
            { "bg-natural-100 text-brand-700": label === "most-common" },
            { "bg-brand-700 text-natural-50": label === "most-valuable" }
          )}
        >
          {label === "most-common" ? intl("plan/label/most-common") : null}
          {label === "most-valuable" ? intl("plan/label/most-valuable") : null}
        </Typography>
      ) : null}
      <div>
        <div className="flex items-center gap-4 mb-1 md:mb-2">
          <Typography
            tag="h4"
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
                {intl("plan/discount", {
                  value: formatNumber(discount, { maximumFractionDigits: 2 }),
                })}
              </Typography>
            </div>
          ) : null}
        </div>

        <Typography
          tag="p"
          className={cn(
            "inline-block mb-2 md:mb-4 text-tiny font-regular md:font-semibold",
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
            "font-bold text-body lg:text-h4 mb-1 lg:mb-2",
            primary ? "text-natural-50" : "text-brand-700"
          )}
        >
          {intl("plan/weekly-minutes", {
            value: formatNumber(weeklyMinutes),
          })}
        </Typography>
        <Typography
          tag="span"
          className={cn(
            "text-caption lg:text-subtitle-1 font-semibold lg:font-bold",
            primary ? "text-natural-50" : "text-natural-950"
          )}
        >
          {intl("plan/price", {
            value: formatNumber(priceAfterDiscount, {
              maximumFractionDigits: 2,
            }),
          })}
        </Typography>
      </div>

      <Link
        href={router.web({
          route: Web.Register,
          role: IUser.Role.Student,
          full: true,
        })}
      >
        <Button
          type="main"
          variant={primary ? "secondary" : "primary"}
          htmlType="button"
          size="large"
          className={cn("mt-4 md:mt-6 w-full")}
        >
          <Typography
            tag="span"
            className="font-medium text-caption lg:text-body"
          >
            {intl("plan/button/buy")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

export default PlanCard;
