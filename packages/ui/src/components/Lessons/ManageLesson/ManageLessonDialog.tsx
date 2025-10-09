import { AvatarV2 } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Block } from "@/components/Lessons/ManageLesson/Block";
import { Confirmation } from "@/components/Lessons/ManageLesson/Confirmation";
import { Step } from "@/components/Lessons/ManageLesson/types";
import { Loading, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import CalendarEmpty from "@litespace/assets/CalendarEmpty";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import ChevronRight from "@litespace/assets/ChevronRight";
import NoMoreMinutes from "@litespace/assets/NoMoreMinutes";
import Sun from "@litespace/assets/Sun";
import SunFog from "@litespace/assets/SunFog";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import { MAX_LESSON_DURATION, MIN_LESSON_DURATION } from "@litespace/utils";
import {
  getSubSlotsBatch as getSubSlots,
  orderSlots,
  subtractSlotsBatch as subtractSlots,
} from "@litespace/utils/availabilitySlots";
import cn from "classnames";
import { Dayjs } from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { isEmpty, range } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const LoadingWrapper: React.FC<{
  tutorName: string | null;
}> = ({ tutorName }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div className="w-full flex flex-col justify-center items-center gap-8 md:mt-[109px] md:mb-[110px]">
      <Loading
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
    <div className="md:w-full flex flex-col justify-center items-center gap-8 md:mt-[82px] md:mb-[82px]">
      <LoadingError
        error={intl("book-lesson.error-slots", { tutor: tutorName })}
        retry={retry}
        size={md ? "large" : "small"}
      />
    </div>
  );
};

const BusyTutor: React.FC<{
  tutorName: string | null;
  tutorsUrl: string;
  close: Void;
}> = ({ tutorName, tutorsUrl, close }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn("flex items-center flex-col mt-4 justify-center mx-auto")}
    >
      <CalendarEmpty />
      <Typography
        tag="span"
        className="text-natural-700 text-center font-bold text-body mt-2"
      >
        {intl("book-lesson.empty-slots", { value: tutorName })}
      </Typography>
      <div className="flex flex-col gap-2 w-full mt-4">
        <Button size="large" className="w-full">
          <Typography tag="span" className="text">
            {intl("book-lesson.notification-on-lessons-availability")}
          </Typography>
        </Button>
        <Link to={tutorsUrl} tabIndex={-1}>
          <Button
            htmlType="button"
            size="large"
            variant="secondary"
            className="w-full"
            onClick={close}
          >
            <Typography tag="span" className="text">
              {intl("book-lesson.redirect-to-tutors-page")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

const Animation: React.FC<{
  id?:
    | Step
    | "loading"
    | "busy-tutor"
    | "error"
    | "has-booked-lesson"
    | "depleted-subscription"
    | "unverified";
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

const DepletedSubscription: React.FC<{ plansUrl: string }> = ({ plansUrl }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-10">
      <NoMoreMinutes className="w-[168px] h-[168px]" />
      <div className="flex flex-col gap-4">
        <Typography
          tag="p"
          className="text-caption sm:text-body font-bold text-natural-700"
        >
          {intl("book-lesson.depleted-subscription")}
        </Typography>
        <Link to={plansUrl} className="w-full">
          <Button size="large" className="w-full">
            <Typography tag="span" className="text">
              {intl("book-lesson.subscription-dialog.btn")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
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
  dateBoundaries?: {
    start: Dayjs;
    end: Dayjs;
  };
  slots: IAvailabilitySlot.Self[];
  bookedSlots: IAvailabilitySlot.SubSlot[];
  subscribed: boolean;
  hasBookedLessons: boolean;
  remainingWeeklyMinutes: number;
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
  type?: "book" | "update";
  tutorsUrl: string;
  plansUrl: string;
}> = ({
  open,
  tutorId,
  name,
  imageUrl,
  slots,
  bookedSlots,
  loading,
  error,
  confirmationLoading,
  subscribed,
  hasBookedLessons,
  remainingWeeklyMinutes,
  dateBoundaries,
  tutorsUrl,
  plansUrl,
  close,
  onSubmit,
  retry,
  type = "book",
  ...initials
}) => {
  const { sm } = useMediaQuery();
  const intl = useFormatMessage();

  const [currentDate, setCurrentDate] = useState<Dayjs>(
    dayjs(initials.start) || dayjs()
  );

  const dateBounds = useMemo(() => {
    if (dateBoundaries) return dateBoundaries;
    const start = currentDate.startOf("week");
    const end = start.add(1, "week");
    return { start, end };
  }, [currentDate, dateBoundaries]);

  const unbookedSlots = useMemo(
    () =>
      subtractSlots({ slots, subslots: bookedSlots }).filter((slot) =>
        dayjs(slot.start).isBefore(dateBounds.end)
      ),
    [slots, bookedSlots, dateBounds.end]
  );

  const selectDaySlots = useCallback(
    (day: Dayjs) => {
      const daySlots = unbookedSlots.filter(
        (event) =>
          day.isSame(event.start, "day") || day.isSame(event.end, "day")
      );
      return getSubSlots(daySlots, MAX_LESSON_DURATION);
    },
    [unbookedSlots]
  );

  const availableSlots = useMemo(
    () =>
      orderSlots(
        selectDaySlots(currentDate).map((slot) => ({
          ...slot,
          bookable: dayjs(slot.start).isAfter(dayjs()),
        })),
        "asc"
      ),
    [currentDate, selectDaySlots]
  );

  const isTutorBusy = useMemo(() => isEmpty(unbookedSlots), [unbookedSlots]);

  const depletedSubscription = useMemo(
    () => subscribed && remainingWeeklyMinutes < MIN_LESSON_DURATION,
    [remainingWeeklyMinutes, subscribed]
  );

  const canBook = useMemo(
    () =>
      !error &&
      !loading &&
      !depletedSubscription &&
      (!hasBookedLessons || type === "update"),
    [error, loading, depletedSubscription, hasBookedLessons, type]
  );

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <div className="flex gap-2 pb-4">
          <div className="w-[43px] h-[43px] rounded-[4px] overflow-hidden">
            <AvatarV2 alt={name} id={tutorId} src={imageUrl} />
          </div>
          <div className="flex flex-col gap-1">
            <Typography tag="p" className="text-caption font-bold">
              {intl("book-lesson.title-1")}
            </Typography>
            <Typography tag="p" className="text-tiny text-natural-600">
              {name
                ? intl("book-lesson.title-2", { tutor: name })
                : intl("book-lesson.title.placeholder")}
            </Typography>
          </div>
        </div>
      }
      className={cn(
        "w-full max-w-[550px] mx-auto px-0 py-4 lg:!py-6 sm:w-[512px] [&>div:first-child]:!px-4 sm:[&>div:first-child]:!px-0",
        {
          "!left-0 right-0 translate-x-0": !sm,
        }
      )}
    >
      <div>
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <Animation key="loading" id="loading">
              <LoadingWrapper tutorName={name} />
            </Animation>
          ) : null}

          {error && !loading ? (
            <Animation key="error" id="error">
              <Error retry={retry} tutorName={name} />
            </Animation>
          ) : null}

          {depletedSubscription && !error && !loading ? (
            <Animation key="depleted-subscription" id="depleted-subscription">
              <DepletedSubscription plansUrl={plansUrl} />
            </Animation>
          ) : null}

          {hasBookedLessons &&
          !subscribed &&
          !depletedSubscription &&
          !error &&
          !loading &&
          type === "book" ? (
            <Animation key="has-booked-lesson" id="has-booked-lesson">
              <Block close={close} type="has-booked" />
            </Animation>
          ) : null}

          {isTutorBusy && canBook ? (
            <Animation key="busy-tutor" id="busy-tutor">
              <BusyTutor tutorName={name} tutorsUrl={tutorsUrl} close={close} />
            </Animation>
          ) : null}

          {canBook && !isTutorBusy ? (
            <LessonSelect
              currentDate={currentDate}
              setCurrentDate={(date) => setCurrentDate(date)}
              slots={availableSlots}
              confirmationLoading={confirmationLoading}
              onSubmit={onSubmit}
              tutor={{ name, id: tutorId, imageUrl }}
              canBook={canBook}
              initials={{ slotId: initials.slotId, start: initials.start }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </Dialog>
  );
};

const LessonSelect: React.FC<{
  currentDate: Dayjs;
  setCurrentDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  slots: (IAvailabilitySlot.SubSlot & { bookable: boolean })[];
  tutor: {
    name: string | null;
    imageUrl: string | null;
    id: number;
  };
  confirmationLoading?: boolean;
  onSubmit: ({
    start,
    slotId,
    duration,
  }: {
    start: string;
    slotId: number;
    duration: number;
  }) => void;
  canBook: boolean;
  initials: { slotId?: number | undefined; start?: string | undefined };
}> = ({
  currentDate,
  setCurrentDate,
  slots,
  tutor,
  onSubmit,
  canBook,
  confirmationLoading,
  initials,
}) => {
  const intl = useFormatMessage();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(
    initials.slotId || null
  );
  const [selectedLessonStart, setSelectedLessonStart] = useState<string | null>(
    initials.start || null
  );
  const [step, setStep] = useState<"select" | "confirm">("select");

  return (
    <div>
      {step === "select" ? (
        <>
          <div
            className={cn(
              "border border-natural-200 rounded-lg bg-natural-0 py-2 mb-2",
              "flex items-center justify-center"
            )}
          >
            <Typography tag="span" className="text-extra-tiny text-natural-950">
              {intl("book-lesson.durations.30-minutes")}
            </Typography>
          </div>

          <Divider />

          <WeekSelect
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />

          <DaySelect
            currentDate={currentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <Divider />
          <SlotSelect
            slots={slots}
            selectedSlotId={selectedSlotId}
            selectedSlotStart={selectedLessonStart}
            setSelectedSlotId={setSelectedSlotId}
            setSelectedLessonStart={setSelectedLessonStart}
          />
          <Button
            size="large"
            onClick={() => setStep("confirm")}
            className="w-full mt-6"
          >
            <Typography tag="span" className="text text-body font-medium">
              {intl("book-lesson.confirm")}
            </Typography>
          </Button>
        </>
      ) : null}

      {canBook && step === "confirm" && selectedLessonStart ? (
        <Animation key="confimration" id="confirmation">
          <div className="px-4 md:px-0">
            <Confirmation
              tutorId={tutor.id}
              name={tutor.name}
              imageUrl={tutor.imageUrl}
              start={selectedLessonStart}
              confirmationLoading={confirmationLoading}
              duration={MAX_LESSON_DURATION}
              onConfrim={() => {
                if (!selectedSlotId) return;

                setStep("select");
                return onSubmit({
                  start: selectedLessonStart,
                  slotId: selectedSlotId,
                  duration: MAX_LESSON_DURATION,
                });
              }}
              onEdit={() => setStep("select")}
            />
          </div>
        </Animation>
      ) : null}
    </div>
  );
};

const WeekSelect: React.FC<{
  currentDate: Dayjs;
  setCurrentDate: React.Dispatch<React.SetStateAction<Dayjs>>;
}> = ({ currentDate, setCurrentDate }) => {
  return (
    <div className="w-full flex flex-row sm:gap-4 items-center justify-between mt-4">
      <Button
        type="natural"
        variant="secondary"
        onClick={() => setCurrentDate((prev) => prev.subtract(1, "week"))}
        htmlType="button"
        startIcon={<ChevronRight className="icon [&>*]:stroke-natural-700" />}
      />
      <Typography
        tag="span"
        className="text-natural-950 text-caption lg:text-body font-bold"
      >
        {currentDate.startOf("week").format("DD MMMM")}
        {" - "}
        {currentDate.endOf("week").format("DD MMMM")}
      </Typography>
      <Button
        type="natural"
        variant="secondary"
        onClick={() => setCurrentDate((prev) => prev.add(1, "week"))}
        htmlType="button"
        startIcon={<ChevronLeft className="icon [&>*]:stroke-natural-700" />}
      />
    </div>
  );
};

const DaySelect: React.FC<{
  currentDate: Dayjs;
  selectedDate: Dayjs | null;
  setSelectedDate: (date: Dayjs) => void;
}> = ({ currentDate, selectedDate, setSelectedDate }) => {
  return (
    <div className="my-4 flex justify-between ">
      {range(7).map((_, index) => {
        const day = currentDate.startOf("week").add(index, "days");

        return (
          <div
            key={index}
            className="flex flex-col gap-[6px] items-center hover:cursor-pointer"
            onClick={() => setSelectedDate(day)}
          >
            <Typography
              tag="span"
              className={cn(
                "text-extra-tiny font-medium",
                day.isSame(selectedDate, "day")
                  ? "text-brand-500"
                  : "text-natural-600"
              )}
            >
              {day.format("dddd")}
            </Typography>
            <Typography
              tag="span"
              className={cn(
                "text-extra-tiny font-medium w-6 h-6 rounded-[4px]",
                "flex items-center justify-center",
                day.isSame(selectedDate, "day")
                  ? "border border-brand-500 text-brand-500"
                  : "text-natural-950"
              )}
            >
              {currentDate.startOf("week").add(index, "days").format("D")}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};

const SlotSelect: React.FC<{
  slots: (IAvailabilitySlot.SubSlot & { bookable: boolean })[];
  selectedSlotId: number | null;
  selectedSlotStart: string | null;
  setSelectedLessonStart: (start: string) => void;
  setSelectedSlotId: (id: number) => void;
}> = ({
  slots,
  selectedSlotId,
  selectedSlotStart,
  setSelectedLessonStart,
  setSelectedSlotId,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <Sun className="w-4 h-4 [&>*]:stroke-[#292D32]" />
            <Typography tag="p" className="text-tiny font-bold">
              {intl("book-lesson.labels.am")}
            </Typography>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-2">
              {slots
                .filter((slot) => slot.bookable)
                .filter((slot) => dayjs(slot.start).hour() <= 12)
                .map((slot) => {
                  return (
                    <Button
                      size="large"
                      variant="secondary"
                      type={
                        selectedSlotId === slot.parent &&
                        selectedSlotStart === slot.start
                          ? "main"
                          : "natural"
                      }
                      className="w-full"
                      onClick={() => {
                        setSelectedSlotId(slot.parent);
                        setSelectedLessonStart(slot.start);
                      }}
                    >
                      <Typography tag="p" className="text-center">
                        {dayjs(slot.start).format("hh:mm")}
                      </Typography>
                    </Button>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <SunFog className="w-4 h-4 [&>*]:stroke-[#292D32]" />
            <Typography tag="p" className="text-tiny font-bold">
              {intl("book-lesson.labels.pm")}
            </Typography>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {slots
              .filter((slot) => slot.bookable)
              .filter((slot) => dayjs(slot.start).hour() > 12)
              .map((slot) => {
                return (
                  <Button
                    size="large"
                    variant="secondary"
                    type={
                      selectedSlotId === slot.parent &&
                      selectedSlotStart === slot.start
                        ? "main"
                        : "natural"
                    }
                    className="w-full"
                    onClick={() => {
                      setSelectedSlotId(slot.parent);
                      setSelectedLessonStart(slot.start);
                    }}
                  >
                    <Typography tag="p" className="text">
                      {dayjs(slot.start).format("hh:mm")}
                    </Typography>
                  </Button>
                );
              })}
          </div>
        </div>
      </div>
      <Typography tag="p" className="text-tiny text-natural-600 mt-2">
        {intl("book-lesson.labels.time-zone")}
      </Typography>
    </div>
  );
};

const Divider: React.FC = () => {
  return <div className="w-full border-b border-natural-100" />;
};
