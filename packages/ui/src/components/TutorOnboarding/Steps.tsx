import React from "react";
import { Typography } from "@/components/Typography";
import SocialTelegram from "@litespace/assets/SocialTelegram";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks";
import Check2 from "@litespace/assets/Check2";
import cn from "classnames";
import { motion } from "framer-motion";
import { isEmpty } from "lodash";
import { Void } from "@litespace/types";
import { Link } from "react-router-dom";
import { Interview, StepData } from "@/components/TutorOnboarding/types";
import { PreviousInterviews } from "@/components/TutorOnboarding/PastIntrerviews";

function isActiveState(stepId: number, activeStep: number) {
  if (stepId < activeStep) return "fullfilled";

  if (stepId === activeStep) return "active";

  return "pending";
}

const stepsData: StepData[] = [
  {
    id: 1,
    title: "tutor.onboarding.steps.1.title",
    description: "tutor.onboarding.steps.1.description",
  },
  {
    id: 2,
    title: "tutor.onboarding.steps.2.title",
    description: "tutor.onboarding.steps.2.description",
  },
  {
    id: 3,
    title: "tutor.onboarding.steps.3.title",
    description: "tutor.onboarding.steps.3.description",
  },
  {
    id: 4,
    title: "tutor.onboarding.steps.4.title",
    description: "tutor.onboarding.steps.4.description",
  },
];

export const Steps: React.FC<{
  loading: boolean;
  error: boolean;
  activeStep: number;
  tutorManager: string;
  previousInterviews?: Interview[];
  more: Void;
}> = ({
  loading,
  error,
  tutorManager,
  activeStep,
  previousInterviews,
  more,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="p-6 border bg-natural-50 border-natural-200 h-full">
      <div className="max-w-[368px] flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[13px]">
            <SocialTelegram className="w-8 h-8" />
            <Typography
              tag="p"
              className="text-tiny font-semibold text-natural-700"
            >
              {intl("tutor.onboarding.join-telegram")}
            </Typography>
          </div>
          <Link target="_blank" to={"https://t.me/litespace_tutors"}>
            <Button variant="secondary" size="medium">
              {intl("tutor.onboarding.join")}
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          {stepsData.map((step) => (
            <Step
              tutorManager={tutorManager}
              key={step.id}
              state={isActiveState(step.id, activeStep)}
              {...step}
            />
          ))}
        </div>
      </div>
      {!loading && !error && isEmpty(previousInterviews) ? null : (
        <PreviousInterviews
          loading={loading}
          error={error}
          interviews={previousInterviews}
          more={more}
        />
      )}
    </div>
  );
};

const Step: React.FC<
  StepData & {
    tutorManager: string;
    id: number;
    state: "active" | "fullfilled" | "pending";
  }
> = ({ id, title, description, state, tutorManager }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex gap-2 relative">
      <div
        className={cn(
          "w-11 h-11 flex z-[2] shrink-0 justify-center items-center border border-brand-700 rounded-full",
          state === "pending" && "opacity-50 !border-natural-500",
          state === "fullfilled" ? "bg-brand-700" : "bg-natural-50"
        )}
      >
        {state === "fullfilled" ? (
          <Check2 className="w-6 h-6" />
        ) : (
          <Typography
            tag="span"
            className={cn("text-subtitle-2 font-semibold", {
              "text-brand-700": state !== "pending",
              "text-natural-500": state === "pending",
            })}
          >
            {id}
          </Typography>
        )}
      </div>
      {state === "fullfilled" ? (
        <motion.div
          animate={{
            height: "calc(100% - 44px + 24px)",
          }}
          transition={{
            duration: 0.5,
            delay: id * 0.5,
          }}
          className="w-[1.5px] absolute right-[21px] top-11 bg-brand-700"
        />
      ) : null}
      <div className="flex flex-col gap-[5px]">
        <Typography tag="h4" className="text-caption text-natural-950">
          {intl(title)}
        </Typography>
        <Typography tag="p" className="text-tiny text-natural-700">
          {intl(description, { tutor: tutorManager })}
        </Typography>
      </div>
    </div>
  );
};
