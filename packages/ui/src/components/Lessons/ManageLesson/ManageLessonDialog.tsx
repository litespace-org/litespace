import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/ManageLesson/Stepper";
import { Step } from "@/components/Lessons/ManageLesson/types";
import { DateSelection } from "@/components/Lessons/ManageLesson/DateSelection";
import { DurationSelection } from "@/components/Lessons/ManageLesson/DurationSelection";
import { TimeSelection } from "@/components/Lessons/ManageLesson/TimeSelection";
import { Confirmation } from "@/components/Lessons/ManageLesson/Confirmation";
import { Button } from "@/components/Button";
import LongRightArrow from "@litespace/assets/LongRightArrow";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { concat, isEmpty } from "lodash";
import cn from "classnames";
import CalendarEmpty from "@litespace/assets/CalendarEmpty";
import { Loader, LoadingError } from "@/components/Loading";
import {
  getSubSlotsBatch as getSubSlots,
  orderSlots,
  subtractSlotsBatch as subtractSlots,
} from "@litespace/utils";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const Loading: React.FC<{
  tutorName: string | null;
}> = ({ tutorName }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div className="md:w-[580px] flex flex-col justify-center items-center gap-8 md:mt-[81px] md:mb-[106px]">
      <Loader
        size={md ? "medium" : "small"}
        text={
          tutorName
            ? intl("book-lesson.loading-slots", { tutor: tutorName })
            : undefined
        }
      />
    </div>
  );
};

const Error: React.FC<{
  tutorName: string | null;
  retry: Void;
}> = ({ tutorName, retry }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div className="md:w-[580px] flex flex-col justify-center items-center gap-8 md:mt-[47px] md:mb-[71px]">
      <LoadingError
        error={intl("book-lesson.error-slots", { tutor: tutorName })}
        retry={retry}
        size={md ? "medium" : "small"}
      />
    </div>
  );
};

const BusyTutor: React.FC<{ tutorName: string | null }> = ({ tutorName }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "flex items-center flex-col w-[22rem] gap-8 justify-center mx-auto mt-4 md:mt-[82px] mb-6 md:mb-[142px]"
      )}
    >
      <CalendarEmpty />
      <Typography
        tag="span"
        className="text-brand-700 text-center font-bold text-body lg:text-subtitle-2"
      >
        {tutorName
          ? intl("book-lesson.empty-slots", { tutor: tutorName })
          : null}
      </Typography>
    </div>
  );
};

const Animation: React.FC<{
  id?: Step | "loading" | "busy-tutor" | "error";
  children: React.ReactNode;
}> = ({ id, children }) => {
  const duration = useMemo(() => {
    if (id === "date-selection" || id === "loading" || id === "busy-tutor")
      return 0.5;
    return 0.4;
  }, [id]);

  return (
    <motion.div
      key={id}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration,
          ease: "linear",
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export const ManageLessonDialog: React.FC<{
  /**
   * Flag to show or hide the dialog
   */
  open: boolean;
  /**
   * Handler to close the dialog.
   */
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
  loading?: boolean;
  error?: boolean;
  confirmationLoading?: boolean;
  slotId?: number;
  start?: string;
  duration?: number;
  slots: IAvailabilitySlot.Self[];
  bookedSlots: IAvailabilitySlot.SubSlot[];
  retry: Void;
  /**
   * Generic function that will submit data either to be booked or edited
   */
  onSubmit: ({
    slotId,
    start,
    duration,
  }: {
    slotId: number;
    start: string;
    duration: ILesson.Duration;
  }) => void;
}> = ({
  open,
  close,
  tutorId,
  name,
  imageUrl,
  slots,
  bookedSlots,
  onSubmit,
  loading,
  error,
  confirmationLoading,
  retry,
  ...initials
}) => {
  const { sm } = useMediaQuery();
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [duration, setDuration] = useState<number>(initials.duration || 15);
  const [lessonDetails, setLessonDetails] = useState<{
    start: string | null;
    slotId: number | null;
  }>({
    start: initials.start || null,
    slotId: initials.slotId || null,
  });

  const [date, setDate] = useState<Dayjs | null>(
    initials.start ? dayjs.utc(initials.start).startOf("day") : null
  );

  const dateBounds = useMemo(() => {
    const min = dayjs();
    const max = dayjs().add(2, "months");
    return { min, max };
  }, []);

  const unbookedSlots = useMemo(
    () => subtractSlots({ slots, subslots: bookedSlots }),
    [slots, bookedSlots]
  );

  const selectDaySlots = useCallback(
    (day: Dayjs | null) => {
      if (!day) return [];
      const daySlots = unbookedSlots.filter(
        (event) =>
          day.isSame(event.start, "day") || day.isSame(event.end, "day")
      );
      return getSubSlots(daySlots, duration);
    },
    [duration, unbookedSlots]
  );

  /**
   * Date is considered valid in case it has at least one bookable (free) slot.
   */
  const isValidDate = useCallback(
    (date: Dayjs | null) => !!date && !isEmpty(selectDaySlots(date)),
    [selectDaySlots]
  );

  /**
   * List of all slots including booked and not-yet-booked slots.
   */
  const allSlots = useMemo(() => {
    const availableSlots = selectDaySlots(date).map((slot) => ({
      ...slot,
      bookable: true,
    }));
    return orderSlots(
      concat(
        availableSlots,
        bookedSlots.map((slot) => ({ ...slot, bookable: false }))
      ),
      "asc"
    );
  }, [selectDaySlots, date, bookedSlots]);

  const isTutorBusy = useMemo(() => isEmpty(unbookedSlots), [unbookedSlots]);

  return (
    <Dialog
      open={open}
      close={close}
      position={sm ? "center" : "bottom"}
      title={
        <Typography
          tag="header"
          className="text-natural-950 font-bold text-body md:text-subtitle-2"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
      className={cn(
        "px-0 py-4 lg:!py-6 [&>div:first-child]:!px-4 md:[&>div:first-child]:!px-0 lg:[&>div:first-child]:!px-6",
        {
          "!left-0 right-0 translate-x-0": !sm,
        }
      )}
    >
      {!loading && !error ? (
        <div className="mt-6 md:mt-8 px-4 md:px-0">
          <Stepper step={step} />
        </div>
      ) : null}

      <div
        className={cn({
          "mt-6": step === "date-selection",
          "mt-6 md:mt-8": step === "time-selection",
        })}
      >
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <Animation key="loading" id="loading">
              <Loading tutorName={name} />
            </Animation>
          ) : null}

          {error ? (
            <Animation key="error" id="error">
              <Error retry={retry} tutorName={name} />
            </Animation>
          ) : null}

          {isTutorBusy && !loading && !error ? (
            <Animation key="busy-tutor" id="busy-tutor">
              <BusyTutor tutorName={name} />
            </Animation>
          ) : null}

          {step === "date-selection" && !loading && !error && !isTutorBusy ? (
            <Animation key="date-selection" id="date-selection">
              <DateSelection
                min={dateBounds.min}
                max={dateBounds.max}
                selected={date}
                onSelect={setDate}
                isSelectable={isValidDate}
              />
            </Animation>
          ) : null}

          {!isTutorBusy &&
          step === "duration-selection" &&
          !loading &&
          !error ? (
            <Animation key="duration-selection" id="duration-selection">
              <div className="px-4 md:px-0 mt-6 md:mt-14 mb-10 md:mb-[82px]">
                <DurationSelection value={duration} onChange={setDuration} />
              </div>
            </Animation>
          ) : null}

          {!isTutorBusy && step === "time-selection" && !loading && !error ? (
            <Animation key="time-selection" id="time-selection">
              <TimeSelection
                slots={allSlots}
                start={lessonDetails.start}
                slotId={lessonDetails.slotId}
                select={(slotId: number, start: string) => {
                  setLessonDetails({
                    slotId,
                    start,
                  });
                }}
              />
            </Animation>
          ) : null}

          {!isTutorBusy &&
          step === "confirmation" &&
          lessonDetails.start &&
          !loading &&
          !error ? (
            <Animation key="confimration" id="confirmation">
              <div className="px-4 md:px-0">
                <Confirmation
                  tutorId={tutorId}
                  name={name}
                  imageUrl={imageUrl}
                  start={lessonDetails.start}
                  confirmationLoading={confirmationLoading}
                  duration={duration}
                  onConfrim={() => {
                    if (!lessonDetails.start || !lessonDetails.slotId) return;
                    return onSubmit({
                      start: lessonDetails.start,
                      slotId: lessonDetails.slotId,
                      duration,
                    });
                  }}
                  onEdit={() => {
                    setStep("date-selection");
                  }}
                />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>

      {step !== "confirmation" && !loading && !error && !isTutorBusy ? (
        <div
          className={cn(
            "flex flex-row gap-4 md:gap-[14px] w-full md:ms-auto md:w-fit px-4 md:px-0",
            {
              "mt-6": step === "date-selection",
              "mt-10 md:mt-6": step === "time-selection",
            }
          )}
        >
          {step !== "date-selection" ? (
            <Button
              startIcon={
                <LongRightArrow className="w-6 h-6 -ms-2 -mt-1 icon" />
              }
              size="large"
              onClick={() => {
                if (step === "time-selection") setStep("duration-selection");
                if (step === "duration-selection") setStep("date-selection");
              }}
              className={cn({
                "flex-1 md:w-[133px]":
                  step === "duration-selection" || step === "time-selection",
              })}
            >
              <Typography
                tag="label"
                className="text-caption md:text-body font-semibold md:font-medium text-natural-50 inline-block"
              >
                {intl("book-lesson.steps.prev")}
              </Typography>
            </Button>
          ) : null}

          <Button
            endIcon={<LongLeftArrow className="w-6 h-6 -mt-1 icon" />}
            size="large"
            onClick={() => {
              if (step === "date-selection") setStep("duration-selection");
              if (step === "duration-selection") setStep("time-selection");
              if (step === "time-selection") setStep("confirmation");
            }}
            disabled={
              (step === "time-selection" && !lessonDetails.start) ||
              !isValidDate(date)
            }
            className={cn({
              "!w-[156px] lg:w-[196px] ms-auto": step === "date-selection",
              "flex-1 lg:w-[128px]":
                step === "duration-selection" || step === "time-selection",
            })}
          >
            <Typography tag="label" className="font-semibold text-natural-50">
              {intl("book-lesson.steps.next")}
            </Typography>
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
};
