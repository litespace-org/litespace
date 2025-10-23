import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import CheckMark from "@litespace/assets/CheckMark";
import { ILesson, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { price, TOTAL_LESSON_HOURLY_RATE } from "@litespace/utils";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";

export const TrialSessionCard: React.FC<{ onClick: Void }> = ({ onClick }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "md:last:col-span-2 xl:last:col-span-1 md:first:justify-self-end md:[&:nth-of-type(2)]:justify-self-start",
        "xl:first:justify-self-auto xl:[&>nth-of-type(2)]:justify-self-auto",
        "relative flex flex-col",
        "w-full h-full p-[24px] xl:p-[32px]",
        "min-w-[323px] max-w-[400px]",
        "bg-natural-50 rounded-2xl border border-natural-100"
      )}
    >
      <div className={cn("flex gap-2 md:items-start mb-2")}>
        <Typography
          tag="p"
          className="text-subtitle-2 font-bold text-natural-950 text-center"
        >
          {intl("plan.card.trial.title")}
        </Typography>
      </div>

      <Typography
        tag="p"
        className="font-semibold text-tiny text-natural-700 mb-4 min-h-[36px]"
      >
        {intl("plan.card.trial.description")}
      </Typography>

      <FeaturesList
        features={[
          intl("plan.card.trial.feature-1"),
          intl("plan.card.trial.feature-2"),
          intl("plan.card.trial.feature-3"),
        ]}
      />

      <div className="mt-4 flex flex-col gap-1 lg:gap-2">
        <Typography
          tag="p"
          className="flex font-bold text-subtitle-2 text-natural-950 whitespace-nowrap xl:text-[32px]"
        >
          {intl.rich("plan.card.trial.minutes", {
            value: ILesson.Duration.Long,
          })}
        </Typography>

        <div className="flex items-center md:items-start 2xl:items-center md:flex-col 2xl:flex-row gap-1 xl:gap-2">
          <Typography
            tag="span"
            className="flex font-bold text-[16px] text-natural-700 xl:text-[24px]"
          >
            {intl.rich("plan.price", {
              value: price.unscale((TOTAL_LESSON_HOURLY_RATE * 3) / 4),
            })}
          </Typography>
        </div>
      </div>
      <Link onClick={onClick} to={Web.Tutors} tabIndex={-1} className="w-full">
        <Button
          size="large"
          className="mt-6 w-full justify-center py-2 bg-primary-500 font-cairo hover:bg-brand-700"
        >
          {intl("plan.card.try.btn")}
        </Button>
      </Link>
    </div>
  );
};

const FeaturesList: React.FC<{ features: string[] }> = ({ features }) => {
  return (
    <ul className="flex flex-col gap-2 mb-auto">
      {features.map((feature, idx) => (
        <li key={idx} className="flex gap-1">
          <CheckMark className="w-[14px] h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0" />
          <Typography
            tag="span"
            className="font-normal text-tiny text-natural-700"
          >
            {feature}
          </Typography>
        </li>
      ))}
    </ul>
  );
};
