import React from "react";
import { Typography } from "@/components/Typography";
import SocialTelegram from "@litespace/assets/SocialTelegram";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks";
import Check1 from "@litespace/assets/Check1";
import { LocalId } from "@/locales";
import cn from "classnames";

type StepData = {
  id: number;
  title: LocalId;
  description: LocalId;
  state: "active" | "fullfilled" | "pending";
};

const stepsData: StepData[] = [
  {
    id: 1,
    title: "tutor.onboarding.steps.1.title",
    description: "tutor.onboarding.steps.1.description",
    state: "fullfilled",
  },
  {
    id: 2,
    title: "tutor.onboarding.steps.2.title",
    description: "tutor.onboarding.steps.2.description",
    state: "active",
  },
  {
    id: 3,
    title: "tutor.onboarding.steps.3.title",
    description: "tutor.onboarding.steps.3.description",
    state: "pending",
  },
  {
    id: 4,
    title: "tutor.onboarding.steps.4.title",
    description: "tutor.onboarding.steps.4.description",
    state: "pending",
  },
];

export const Steps = () => {
  const intl = useFormatMessage();
  return (
    <div className="p-6 bg-natural-50 border border-natural-200">
      <div className="max-w-[368px] flex flex-col gap-10">
        <div className="flex flex-col gap-2 ">
          <div className="flex items-center gap-[13px]">
            <SocialTelegram className="w-8 h-8" />
            <Typography tag="p" className="text-tiny font-semibold">
              {intl("tutor.onboarding.join-telegram")}
            </Typography>
          </div>
          <Button variant="secondary" size="medium">
            {intl("tutor.onboarding.join")}
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          {stepsData.map((step) => (
            <Step tutorName={"Mostafa"} key={step.id} {...step} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<StepData & { tutorName: string }> = ({
  id,
  title,
  description,
  state,
  tutorName,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex gap-2 relative">
      <div className="w-[1.5px] h-[calc(100%+24px)] bg-brand-700" />
      <div
        className={cn(
          "w-11 h-11 flex shrink-0 justify-center items-center rounded-full border border-brand-700 rounded-full",
          state === "pending" && "opacity-50",
          state === "fullfilled" ? "bg-brand-700" : "bg-natural-50"
        )}
      >
        {state === "fullfilled" ? (
          <Check1 className="w-6 h-6" />
        ) : (
          <Typography
            tag="span"
            className="text-subtitle-2 font-semibold text-brand-700"
          >
            {id}
          </Typography>
        )}
      </div>
      <div className="flex flex-col gap-[5px]">
        <Typography tag="h4" className="text-caption text-natural-950">
          {intl(title)}
        </Typography>
        <Typography tag="p" className="text-tiny text-natural-700">
          {intl(description, { tutor: tutorName })}
        </Typography>
      </div>
    </div>
  );
};

const PreviousInterviews = () => {
  return <div></div>;
};
