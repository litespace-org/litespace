import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import SocialTelegram from "@litespace/assets/SocialTelegram";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks";
import Check2 from "@litespace/assets/Check2";
import { LocalId } from "@/locales";
import cn from "classnames";
import { motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import dayjs from "@/lib/dayjs";
import { Loader, LoadingError } from "@/components/Loading";
import { isEmpty } from "lodash";

type StepData = {
  id: number;
  title: LocalId;
  description: LocalId;
};

type Interview = {
  tutorName: string;
  canceledBy?: "canceled-by-you" | "canceled-by-tutor-manage";
  canceled?: boolean;
  result?: string;
  date: string;
};

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
  previousInterviews: Interview[];
}> = ({ loading, error, activeStep, previousInterviews }) => {
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
          <Button variant="secondary" size="medium">
            {intl("tutor.onboarding.join")}
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          {stepsData.map((step) => (
            <Step
              tutorName={"Mostafa"}
              key={step.id}
              state={
                step.id < activeStep
                  ? "fullfilled"
                  : step.id === activeStep
                    ? "active"
                    : "pending"
              }
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
        />
      )}
    </div>
  );
};

const Step: React.FC<
  StepData & {
    tutorName: string;
    id: number;
    state: "active" | "fullfilled" | "pending";
  }
> = ({ id, title, description, state, tutorName }) => {
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
          {intl(description, { tutor: tutorName })}
        </Typography>
      </div>
    </div>
  );
};

const PreviousInterviews: React.FC<{
  interviews: Array<Interview>;
  loading: boolean;
  error: boolean;
}> = ({ interviews, loading, error }) => {
  const intl = useFormatMessage();

  return (
    <div className="mt-5">
      <Typography
        tag="h3"
        className="text-subtitle-2 font-bold text-black mb-6"
      >
        {intl("tutor.onboarding.previous-interviews.title")}
      </Typography>
      {loading ? (
        <Loader
          size="medium"
          text={intl("tutor.onboarding.previous-interviews.loading")}
        />
      ) : null}
      {error ? (
        <LoadingError
          size="medium"
          error={intl("tutor.onboarding.previous-interviews.error")}
          retry={() => {}}
        />
      ) : null}
      {!loading && !error ? (
        <div className="flex flex-col gap-1">
          {interviews.map((interview, idx) => (
            <Interview interview={interview} key={idx} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Interview: React.FC<{
  interview: Interview;
}> = ({ interview }) => {
  const intl = useFormatMessage();
  const text = useMemo(() => {
    if (interview.result) return interview.result;
    if (
      interview.canceled &&
      interview.canceledBy === "canceled-by-tutor-manage"
    )
      return intl(
        "tutor.onboarding.previous-interviews.cancelled-by-tutor-manage"
      );
    return intl("tutor.onboarding.previous-interviews.cancelled-by-you");
  }, [intl, interview]);

  return (
    <div className="flex gap-[14px] bg-natural-50 border border-natural-100 shadow shadow-previous-interview p-4 rounded-[10px]">
      <div className="w-12 h-12 overflow-hidden rounded-full">
        <Avatar />
      </div>
      <div className="flex flex-col gap-1">
        <Typography tag="h5" className="text-body font-bold text-natural-950">
          {intl("tutor.onboarding.previous-interviews.person", {
            tutor: interview.tutorName,
          })}
        </Typography>
        <Typography tag="p" className="text-natural-600 text-tiny">
          {text}
        </Typography>
        <Typography tag="p" className="text-natural-600 text-tiny">
          {dayjs(interview.date).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
      </div>
    </div>
  );
};
