import React, { useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog/V2";
import { IRule, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/BookLesson/Stepper";
import { Step } from "@/components/Lessons/BookLesson/types";
import { DateSelection } from "@/components/Lessons/BookLesson/DateSelection";
import { DurationSelection } from "@/components/Lessons/BookLesson/DurationSelection";
import { TimeSelection } from "@/components/Lessons/BookLesson/TimeSelection";
import { Button, ButtonSize } from "@/components/Button";
import LongRightArrow from "@litespace/assets/LongRightArrow";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import { AnimatePresence, motion } from "framer-motion";
import { Schedule, splitRuleEvent, unpackRules } from "@litespace/sol/rule";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { flattenDeep } from "lodash";
import { Confirmation } from "./Confirmation";

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
  tutorId: number;
  /**
   * Tutor name.
   */
  name: string | null;
  /**
   * Tutor image url.
   */
  imageUrl: string | null;
  rules: IRule.Self[];
  slots: IRule.Slot[];
  notice: number;
  onBook: (payload: { start: string; duration: number }) => void;
}> = ({
  open,
  close,
  tutorId,
  name,
  imageUrl,
  rules,
  slots,
  notice,
  onBook,
}) => {
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [duration, setDuration] = useState<number>(15);
  const [start, setStart] = useState<string | null>(null);
  const [date, setDate] = useState<Dayjs>(dayjs());

  const dateBounds = useMemo(() => {
    const min = dayjs();
    const max = dayjs().add(2, "months");
    return { min, max };
  }, []);

  const bookable = useMemo(() => {
    const unpacked = unpackRules({
      rules,
      slots,
      start: dateBounds.min.toISOString(),
      end: dateBounds.max.toISOString(),
    });

    const selectedDayEvents = unpacked.filter(
      (event) =>
        date.isSame(event.start, "day") || date.isSame(event.end, "day")
    );

    return Schedule.order(
      flattenDeep(
        selectedDayEvents.map((rule) => splitRuleEvent(rule, duration))
      ).filter((event) =>
        dayjs(event.start).isAfter(dayjs().add(notice, "minutes"))
      ),
      "asc"
    );
  }, [date, dateBounds.max, dateBounds.min, duration, notice, rules, slots]);

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
      className="!tw-p-0 !tw-pt-10 !tw-pb-5 [&>div:first-child]:!tw-px-10"
    >
      <div className="tw-mt-8 tw-px-10">
        <Stepper step={step} />
      </div>

      <div className="tw-mt-9">
        <AnimatePresence>
          {step === "date-selection" ? (
            <Animation step="date-selection">
              <DateSelection
                min={dateBounds.min}
                max={dateBounds.max}
                selected={date}
                onSelect={setDate}
              />
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "duration-selection" ? (
            <Animation step="duration-selection">
              <div className="tw-px-10 tw-mt-5 tw-mb-[34px]">
                <DurationSelection value={duration} onChange={setDuration} />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "time-selection" ? (
            <Animation step="time-selection">
              <TimeSelection
                events={bookable}
                start={start}
                setStart={setStart}
              />
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "confirmation" && start ? (
            <Animation step="confirmation">
              <div className="tw-px-10 tw-mt-5">
                <Confirmation
                  tutorId={tutorId}
                  name={name}
                  imageUrl={imageUrl}
                  start={start}
                  duration={duration}
                  onConfrim={() => onBook({ start, duration })}
                  onEdit={() => {
                    setStep("date-selection");
                  }}
                />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>

      {step !== "confirmation" ? (
        <div className="tw-flex tw-flex-row tw-gap-6 tw-ms-auto tw-w-fit tw-mt-12 tw-px-10 tw-pb-5">
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
            disabled={step === "time-selection" && !start}
          >
            {intl("book-lesson.steps.next")}
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
};
