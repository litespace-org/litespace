import React, { useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog/V2";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/BookLesson/Stepper";
import { Step } from "@/components/Lessons/BookLesson/types";
import { DateSelection } from "@/components/Lessons/BookLesson/DateSelection";
import { DurationSelection } from "@/components/Lessons/BookLesson/DurationSelection";
import { Button, ButtonSize } from "@/components/Button";
import LongRightArrow from "@litespace/assets/LongRightArrow";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import { AnimatePresence, motion } from "framer-motion";

const Animation: React.FC<{ step: Step; children: React.ReactNode }> = ({
  step,
  children,
}) => {
  const duration = useMemo(() => {
    if (step === "date-selection") return 0.5;
    return 0.3;
  }, [step]);

  const delay = useMemo(() => {
    if (step === "date-selection") return 0.4;
    return 0.2;
  }, [step]);

  return (
    <motion.div
      key={step}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration,
          delay,
          ease: "easeInOut",
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      className="tw-mt-9 tw-overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export const BookLesson: React.FC<{
  open: boolean;
  close: Void;
  /**
   * Tutor name.
   */
  name: string | null;
}> = ({ open, close, name }) => {
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("time-selection");
  const [duration, setDuration] = useState<number>(15);

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <Typography
          element="subtitle-2"
          weight="bold"
          className="tw-text-natural-950"
          tag="div"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
    >
      <div className="tw-mt-8">
        <Stepper step={step} />
      </div>

      <div className="tw-mt-9">
        <AnimatePresence>
          {step === "date-selection" ? (
            <Animation step="date-selection">
              <DateSelection />
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "duration-selection" ? (
            <Animation step="duration-selection">
              <DurationSelection value={duration} onChange={setDuration} />
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="tw-flex tw-flex-row tw-gap-6 tw-ms-auto tw-w-fit tw-mt-12">
        {step !== "date-selection" ? (
          <Button
            startIcon={<LongRightArrow />}
            size={ButtonSize.Tiny}
            onClick={() => {
              if (step === "time-selection") setStep("duration-selection");
              if (step === "duration-selection") setStep("date-selection");
            }}
          >
            {intl("book-lesson.steps.prev")}
          </Button>
        ) : null}

        <Button
          endIcon={<LongLeftArrow />}
          size={ButtonSize.Tiny}
          onClick={() => {
            if (step === "date-selection") setStep("duration-selection");
            if (step === "duration-selection") setStep("time-selection");
            if (step === "time-selection") setStep("confirmation");
          }}
        >
          {intl("book-lesson.steps.next")}
        </Button>
      </div>
    </Dialog>
  );
};
