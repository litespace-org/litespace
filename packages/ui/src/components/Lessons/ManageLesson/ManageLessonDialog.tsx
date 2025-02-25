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
    <div className="md:tw-w-[580px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-8 md:tw-mt-[81px] md:tw-mb-[106px]">
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
    <div className="md:tw-w-[580px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-8 md:tw-mt-[47px] md:tw-mb-[71px]">
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
        "tw-flex tw-items-center tw-flex-col tw-w-[22rem] tw-gap-8 tw-justify-center tw-mx-auto tw-mt-4 md:tw-mt-[82px] tw-mb-6 md:tw-mb-[142px]"
      )}
    >
      <CalendarEmpty />
      <Typography
        tag="span"
        className="tw-text-brand-700 tw-text-center tw-font-bold tw-text-body lg:tw-text-subtitle-2"
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
      className="tw-overflow-hidden"
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
          className="tw-text-natural-950 tw-font-bold tw-text-body md:tw-text-subtitle-2"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
      className={cn(
        "tw-px-0 tw-py-4 lg:!tw-py-6 [&>div:first-child]:!tw-px-4 md:[&>div:first-child]:!tw-px-0 lg:[&>div:first-child]:!tw-px-6",
        {
          "!tw-left-0 tw-right-0 tw-translate-x-0": !sm,
        }
      )}
    >
      {!loading && !error ? (
        <div className="tw-mt-6 md:tw-mt-8 tw-px-4 md:tw-px-0">
          <Stepper step={step} />
        </div>
      ) : null}

      <div
        className={cn({
          "tw-mt-6": step === "date-selection",
          "tw-mt-6 md:tw-mt-8": step === "time-selection",
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
              <div className="tw-px-4 md:tw-px-0 tw-mt-6 md:tw-mt-14 tw-mb-10 md:tw-mb-[82px]">
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
              <div className="tw-px-4 md:tw-px-0">
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
            "tw-flex tw-flex-row tw-gap-4 md:tw-gap-[14px] tw-w-full md:tw-ms-auto md:tw-w-fit tw-px-4 md:tw-px-0",
            {
              "tw-mt-6": step === "date-selection",
              "tw-mt-10 md:tw-mt-6": step === "time-selection",
            }
          )}
        >
          {step !== "date-selection" ? (
            <Button
              startIcon={
                <LongRightArrow className="tw-w-6 tw-h-6 -tw-ms-2 -tw-mt-1" />
              }
              size="large"
              onClick={() => {
                if (step === "time-selection") setStep("duration-selection");
                if (step === "duration-selection") setStep("date-selection");
              }}
              className={cn({
                "tw-flex-1 md:tw-w-[133px]":
                  step === "duration-selection" || step === "time-selection",
              })}
            >
              <Typography
                tag="label"
                className="tw-text-caption md:tw-text-body tw-font-semibold md:tw-font-medium tw-text-natural-50 tw-inline-block"
              >
                {intl("book-lesson.steps.prev")}
              </Typography>
            </Button>
          ) : null}

          <Button
            endIcon={<LongLeftArrow className="tw-w-6 tw-h-6 -tw-mt-1" />}
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
              "!tw-w-[156px] lg:tw-w-[196px] tw-ms-auto":
                step === "date-selection",
              "tw-flex-1 lg:tw-w-[128px]":
                step === "duration-selection" || step === "time-selection",
            })}
          >
            <Typography
              tag="label"
              className="tw-font-semibold tw-text-natural-50"
            >
              {intl("book-lesson.steps.next")}
            </Typography>
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
};
