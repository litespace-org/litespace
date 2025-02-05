import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/BookLesson/Stepper";
import { Step } from "@/components/Lessons/BookLesson/types";
import { DateSelection } from "@/components/Lessons/BookLesson/DateSelection";
import { DurationSelection } from "@/components/Lessons/BookLesson/DurationSelection";
import { TimeSelection } from "@/components/Lessons/BookLesson/TimeSelection";
import { Confirmation } from "@/components/Lessons/BookLesson/Confirmation";
import { Button, ButtonSize } from "@/components/Button";
import LongRightArrow from "@litespace/assets/LongRightArrow";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { concat, isEmpty } from "lodash";
import cn from "classnames";
import CalendarEmpty from "@litespace/assets/CalendarEmpty";
import { Loader } from "@/components/Loading";
import {
  getSubSlotsBatch as getSubSlots,
  orderSlots,
  subtractSlotsBatch as subtractSlots,
} from "@litespace/utils";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const Loading: React.FC<{
  tutorName: string | null;
  isLargeScreen: boolean;
}> = ({ tutorName, isLargeScreen }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-w-[628px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-8 tw-mt-[15vh] tw-mb-[146px]">
      <Loader
        size={isLargeScreen ? "medium" : "small"}
        text={
          tutorName
            ? intl("book-lesson.loading-slots", { tutor: tutorName })
            : undefined
        }
      />
    </div>
  );
};

const BusyTutor: React.FC<{ tutorName: string | null }> = ({ tutorName }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-flex tw-items-center tw-flex-col tw-w-[22rem] tw-gap-8 tw-justify-center tw-mx-auto tw-mt-10 lg:tw-mt-[106px] tw-mb-[148px]"
      )}
    >
      <CalendarEmpty />
      <Typography
        element={{ default: "body", lg: "subtitle-2" }}
        weight="bold"
        className="tw-text-brand-700 tw-text-center"
      >
        {tutorName
          ? intl("book-lesson.empty-slots", { tutor: tutorName })
          : null}
      </Typography>
    </div>
  );
};

const Animation: React.FC<{
  id?: Step | "loading" | "busy-tutor";
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

export const BookLessonDialog: React.FC<{
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
  confirmationLoading?: boolean;
  slots: IAvailabilitySlot.Self[];
  bookedSlots: IAvailabilitySlot.SubSlot[];
  onBook: ({
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
  onBook,
  loading,
  confirmationLoading,
}) => {
  const { sm, lg } = useMediaQuery();
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [duration, setDuration] = useState<number>(30);
  const [lessonDetails, setLessonDetails] = useState<{
    start: string | null;
    slotId: number | null;
  }>({
    start: null,
    slotId: null,
  });

  const [date, setDate] = useState<Dayjs | null>(null);

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
          className="tw-text-natural-950"
          element={{ default: "body", lg: "subtitle-2" }}
          weight="bold"
          tag="div"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
      className={cn(
        "tw-px-0 tw-py-4 lg:!tw-py-6 [&>div:first-child]:!tw-px-4 lg:[&>div:first-child]:!tw-px-6",
        {
          "!tw-left-0 tw-right-0 tw-translate-x-0": !sm,
        }
      )}
    >
      {!loading ? (
        <div
          className={cn(
            step === "time-selection" ||
              step === "confirmation" ||
              step === "duration-selection"
              ? "tw-mt-6 lg:tw-mt-8"
              : "tw-mt-6"
          )}
        >
          <Stepper step={step} />
        </div>
      ) : null}

      <div
        className={cn({
          "tw-my-6 !tw-px-4 !lg:tw-px-14": step === "date-selection",
          "tw-mt-6 lg:tw-mt-8 tw-mb-10 lg:tw-mb-6": step === "time-selection",
        })}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <Animation key="loading" id="loading">
              <Loading tutorName={name} isLargeScreen={lg} />
            </Animation>
          ) : null}

          {isTutorBusy && !loading ? (
            <Animation key="busy-tutor" id="busy-tutor">
              <BusyTutor tutorName={name} />
            </Animation>
          ) : null}

          {step === "date-selection" && !loading && !isTutorBusy ? (
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

          {!isTutorBusy && step === "duration-selection" && !loading ? (
            <Animation key="duration-selection" id="duration-selection">
              <div className="tw-mt-6 lg:tw-mt-14 tw-mb-10 lg:tw-mb-[82px]">
                <DurationSelection value={duration} onChange={setDuration} />
              </div>
            </Animation>
          ) : null}

          {!isTutorBusy && step === "time-selection" && !loading ? (
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
          !loading ? (
            <Animation key="confimration" id="confirmation">
              <div>
                <Confirmation
                  isLargeScreen={lg}
                  tutorId={tutorId}
                  name={name}
                  imageUrl={imageUrl}
                  start={lessonDetails.start}
                  confirmationLoading={confirmationLoading}
                  duration={duration}
                  onConfrim={() => {
                    if (!lessonDetails.start || !lessonDetails.slotId) return;
                    return onBook({
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

      {step !== "confirmation" && !loading && !isTutorBusy ? (
        <div className="tw-flex tw-flex-row tw-gap-6 tw-ms-auto tw-w-fit tw-mt-6 tw-px-6 tw-pb-3">
          {step !== "date-selection" ? (
            <Button
              startIcon={<LongRightArrow />}
              size={lg ? ButtonSize.Small : ButtonSize.Tiny}
              onClick={() => {
                if (step === "time-selection") setStep("duration-selection");
                if (step === "duration-selection") setStep("date-selection");
              }}
              className={cn({
                "tw-flex-1 lg:tw-w-[128px]": step === "duration-selection",
              })}
            >
              <Typography
                element={{ default: "caption", lg: "body" }}
                weight="semibold"
                className="tw-text-natural-50"
              >
                {intl("book-lesson.steps.prev")}
              </Typography>
            </Button>
          ) : null}

          <Button
            endIcon={<LongLeftArrow />}
            size={lg ? ButtonSize.Small : ButtonSize.Tiny}
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
              "tw-flex-1 lg:tw-w-[196px]": step === "date-selection",
              "tw-flex-1 lg:tw-w-[128px]": step === "duration-selection",
            })}
          >
            <Typography
              element={{ default: "caption", lg: "body" }}
              weight="semibold"
              className="tw-text-natural-50"
            >
              {intl("book-lesson.steps.next")}
            </Typography>
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
};
