import React, { forwardRef, useEffect, useRef, useState } from "react";
import Telegram from "@litespace/assets/TelegramWithCircle";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Link } from "react-router-dom";
import { LITESPACE_TUTORS_TELEGRAM_GROUP_URL } from "@litespace/utils/constants";
import { StepId } from "@/components/TutorOnboarding/types";
import {
  ONBOARDING_STEPS,
  ONBOARDING_STEP_ID_TO_ORDER,
} from "@/components/TutorOnboarding/constants";
import { LocalId } from "@litespace/ui/locales";
import cn from "classnames";
import Check from "@litespace/assets/Check1";

const Steps: React.FC<{ active: StepId }> = ({ active }) => {
  return (
    <div className="border-r border-natural-100 w-[512px] p-6">
      <div className="w-[368px] flex flex-col gap-10">
        <Support />
        <List active={active} />
      </div>
    </div>
  );
};

const List: React.FC<{ active: StepId }> = ({ active }) => {
  const activeStepRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState<number>(0);

  useEffect(() => {
    setOffsetTop(activeStepRef.current?.offsetTop || 0);
  }, [activeStepRef.current?.offsetTop, active]);

  return (
    <div className="relative flex flex-col gap-6">
      {ONBOARDING_STEPS.map((step) => (
        <Step
          key={step.id}
          title={step.title}
          desc={step.desc}
          id={step.id}
          done={
            ONBOARDING_STEP_ID_TO_ORDER[step.id] <
            ONBOARDING_STEP_ID_TO_ORDER[active]
          }
          active={active === step.id}
          ref={active == step.id ? activeStepRef : undefined}
        />
      ))}
      <ProgressLine height={offsetTop} />
    </div>
  );
};

const Step = forwardRef<
  HTMLDivElement,
  {
    id: StepId;
    title: LocalId;
    desc: LocalId;
    done: boolean;
    active: boolean;
  }
>(({ id, title, desc, done, active }, ref) => {
  const intl = useFormatMessage();

  return (
    <div id={id} className="flex flex-row gap-2" ref={ref}>
      <div
        data-done={done}
        data-active={active}
        className={cn(
          "w-11 h-11 flex items-center justify-center border rounded-full flex-shrink-0 z-onboarding-flow-step-order",
          "data-[active=true]:border-brand-500",
          "data-[done=false]:data-[active=false]:border-natural-500",
          "data-[done=true]:data-[active=false]:bg-brand-500 data-[done=true]:data-[active=false]:border-brand-500"
        )}
      >
        <Typography
          tag="span"
          data-done={done}
          data-active={active}
          className={cn(
            "text-subtitle-2 font-semibold",
            "data-[active=true]:text-brand-500",
            "data-[done=false]:data-[active=false]:text-natural-500",
            "data-[done=true]:hidden"
          )}
        >
          {ONBOARDING_STEP_ID_TO_ORDER[id]}
        </Typography>
        <Check
          data-done={done}
          className="hidden data-[done=true]:block w-6 h-6 [&>path]:stroke-white"
        />
      </div>
      <div>
        <Typography tag="h6" className="text-caption text-natural-950">
          {intl(title)}
        </Typography>
        <Typography tag="p" className="text-tiny text-natural-700">
          {intl(desc)}
        </Typography>
      </div>
    </div>
  );
});

const ProgressLine: React.FC<{ height?: number }> = ({ height = 0 }) => {
  return (
    <div
      className="absolute top-1 right-[calc(2.75rem/2)] translate-x-1/2 w-[1.5px] bg-brand-500"
      style={{ height: height - 3 }}
    />
  );
};

const Support: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3">
        <Telegram className="w-8 h-8 [&>g>path]:fill-natural-600 flex-shrink-0" />
        <Typography tag="p" className="text-tiny font-semibold">
          {intl("tutor-onboarding.steps.support.desc")}
        </Typography>
      </div>

      <Link
        to={LITESPACE_TUTORS_TELEGRAM_GROUP_URL}
        target="_blank"
        tabIndex={-1}
      >
        <Button type="main" variant="secondary">
          {intl("tutor-onboarding.steps.support.join-telegram-group")}
        </Button>
      </Link>
    </div>
  );
};

export default Steps;
