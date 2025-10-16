import { AvatarV2 } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { DateSelection } from "@/components/Lessons/ManageLesson/DateSelection";
import { Step } from "@/components/Lessons/ManageLesson/types";
import { Loading, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import NoMoreMinutes from "@litespace/assets/NoMoreMinutes";
import Sun from "@litespace/assets/Sun";
import SunFog from "@litespace/assets/SunFog";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import { MIN_LESSON_DURATION } from "@litespace/utils";
import {
  getSubSlotsBatch as getSubSlots,
  orderSlots,
  subtractSlotsBatch as subtractSlots,
} from "@litespace/utils/availabilitySlots";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { concat, isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { arabicTimezoneNames } from "@/constants/labels";
import { Block } from "@/components/Lessons/ManageLesson/Block";

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
        size={md ? "medium" : "small"}
      />
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
    if (id === "selection" || id === "loading" || id === "busy-tutor")
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

const DepletedSubscription: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-8 mt-10">
      <NoMoreMinutes className="w-[168px] h-[168px]" />
      <Typography
        tag="p"
        className="text-caption sm:text-body font-bold text-natural-700"
      >
        {intl("book-lesson.depleted-subscription")}
      </Typography>
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
  hasBookedMaxLessons: boolean;
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
  hasBookedMaxLessons,
  remainingWeeklyMinutes,
  dateBoundaries,
  close,
  onSubmit,
  retry,
  type = "book",
  ...initials
}) => {
  const { sm } = useMediaQuery();
  const intl = useFormatMessage();
  const [duration] = useState<number>(initials.duration || MIN_LESSON_DURATION);
  const [lessonDetails, setLessonDetails] = useState<{
    start: string | null;
    slotId: number | null;
  }>({
    start: initials.start || null,
    slotId: initials.slotId || null,
  });

  const [date, setDate] = useState<Dayjs | null>(
    initials.start ? dayjs.utc(initials.start).startOf("day") : dayjs()
  );

  const [dateBounds, setDateBounds] = useState(() => {
    if (dateBoundaries)
      return {
        start: dateBoundaries.start,
        end: dateBoundaries.end,
      };
    const start = dayjs();
    const end = dayjs().startOf("day").add(1, "week");
    return { start, end };
  });

  const unbookedSlots = useMemo(
    () =>
      subtractSlots({ slots, subslots: bookedSlots }).filter(
        (slot) =>
          dayjs(slot.start).isAfter(dayjs().startOf("day")) &&
          dayjs(slot.start).isBefore(dateBounds?.end)
      ),
    [slots, bookedSlots, dateBounds?.end]
  );

  const selectDaySlots = useCallback(
    (day: Dayjs) => {
      const daySlots = unbookedSlots.filter(
        (event) =>
          day.isSame(event.start, "day") || day.isSame(event.end, "day")
      );
      return getSubSlots(daySlots, duration);
    },
    [duration, unbookedSlots]
  );

  const isOutOfSubscribtion = useCallback(
    (date: Dayjs | null) =>
      (!!date && date.isAfter(dateBounds?.end)) ||
      (!!date && date.isBefore(dateBounds?.start)),
    [dateBounds?.end, dateBounds?.start]
  );

  /**
   * Date is considered valid in case it has at least one bookable (free) slot.
   */
  const isValidDate = useCallback(
    (date: Dayjs | null) =>
      !!date &&
      !isEmpty(selectDaySlots(date)) &&
      !isOutOfSubscribtion(date) &&
      dayjs().isBefore(date.endOf("day")),
    [isOutOfSubscribtion, selectDaySlots]
  );

  // search for the first available day to book lessons
  // for better user experience
  useEffect(() => {
    if (!date || date.isAfter(dateBounds?.end)) return;
    if (isEmpty(unbookedSlots)) return;
    if (isValidDate(date)) return;
    setDate((prev) => prev?.add(1, "day") || null);
  }, [date, unbookedSlots, dateBounds, isValidDate]);

  /**
   * List of all slots including booked and unbooked slots.
   */
  const allSlots = useMemo(() => {
    if (!date) return [];

    const availableSlots = selectDaySlots(date).map((slot) => ({
      ...slot,
      bookable: dayjs(slot.start).isAfter(dayjs()),
    }));

    return orderSlots(
      concat(
        availableSlots,
        bookedSlots
          .filter(
            (slot) =>
              date.isSame(slot.start, "day") || date.isSame(slot.end, "day")
          )
          .map((slot) => ({
            ...slot,
            bookable: false,
          }))
      ),
      "asc"
    );
  }, [selectDaySlots, date, bookedSlots]);

  const daySlots = useMemo(
    () => allSlots.filter((slot) => dayjs(slot.start).hour() <= 12),
    [allSlots]
  );

  const nightSlots = useMemo(
    () => allSlots.filter((slot) => dayjs(slot.start).hour() > 12),
    [allSlots]
  );

  const depletedSubscription = useMemo(
    () => subscribed && remainingWeeklyMinutes < MIN_LESSON_DURATION,
    [remainingWeeklyMinutes, subscribed]
  );

  const canBook = useMemo(
    () =>
      !error &&
      !loading &&
      !depletedSubscription &&
      (!hasBookedMaxLessons || subscribed || type === "update"), // NOTE: !hasBookedLessons condition no longer used
    [
      error,
      loading,
      depletedSubscription,
      hasBookedMaxLessons,
      type,
      subscribed,
    ]
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
        "!w-auto max-w-[350px] md:max-w-[550px] mx-auto py-4 lg:!py-6 _sm:w-[512px] [&>div:first-child]:!px-4 sm:[&>div:first-child]:!px-0",
        {
          "!left-0 right-0 translate-x-0": !sm,
        }
      )}
    >
      <div className="mt-4">
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
              <DepletedSubscription />
            </Animation>
          ) : null}

          {/* TODO: substitute this with subscription promotion */}
          {hasBookedMaxLessons &&
          !subscribed &&
          !depletedSubscription &&
          !error &&
          !loading &&
          type === "book" ? (
            <Animation key="has-booked-lesson" id="has-booked-lesson">
              <Block close={close} type="has-booked" />
            </Animation>
          ) : null}

          {canBook ? (
            <Animation key="date-selection" id="selection">
              <div className="flex flex-col gap-6 !max-w-[350px]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <LessonDuration />
                    <Divider />
                  </div>

                  <DateSelection
                    min={dateBounds.start}
                    max={dateBounds.start.add(1, "week")}
                    selected={date}
                    onSelect={(params) => {
                      setDate(params);
                      setLessonDetails({ start: null, slotId: null });
                    }}
                    isSelectable={isValidDate}
                    prev={() => {
                      setLessonDetails({ start: null, slotId: null });
                      setDateBounds((prev) => {
                        setDate(prev.start.subtract(1, "week"));
                        return {
                          start: prev.start.subtract(1, "week"),
                          end: prev.end.subtract(1, "week"),
                        };
                      });
                    }}
                    next={() => {
                      setLessonDetails({ start: null, slotId: null });
                      setDateBounds((prev) => {
                        setDate(prev.start.add(1, "week"));
                        return {
                          start: prev.start.add(1, "week"),
                          end: prev.end.add(1, "week"),
                        };
                      });
                    }}
                  />

                  <Divider />

                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "flex flex-col gap-4",
                        "max-h-[322px] overflow-y-scroll pe-2 [direction:ltr] scrollbar !scrollbar-thumb-natural-500 !scrollbar-track-natural-100"
                      )}
                    >
                      <SlotsContainer
                        slots={daySlots}
                        atNight={false}
                        lessonDetails={lessonDetails}
                        setLessonDetails={(start, slotId) =>
                          setLessonDetails(() => ({ start, slotId }))
                        }
                      />
                      <SlotsContainer
                        slots={nightSlots}
                        atNight={true}
                        lessonDetails={lessonDetails}
                        setLessonDetails={(start, slotId) =>
                          setLessonDetails(() => ({ start, slotId }))
                        }
                      />
                    </div>
                    <Typography
                      tag="p"
                      className="text-tiny text-natural-600 mt-2"
                    >
                      {intl("book-lesson.labels.time-zone", {
                        value:
                          arabicTimezoneNames[
                            dayjs.tz.guess() as keyof typeof arabicTimezoneNames
                          ],
                      })}
                    </Typography>
                  </div>
                </div>
                <Button
                  size="large"
                  className="w-full"
                  disabled={!lessonDetails.slotId || !lessonDetails.start}
                  onClick={() => {
                    if (!lessonDetails.start || !lessonDetails.slotId) return;
                    return onSubmit({
                      start: lessonDetails.start,
                      slotId: lessonDetails.slotId,
                      duration,
                    });
                  }}
                >
                  <Typography tag="span" className="text-body font-medium">
                    {intl("book-lesson.confirm")}
                  </Typography>
                </Button>
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>
    </Dialog>
  );
};

const SlotsContainer: React.FC<{
  slots: IAvailabilitySlot.SubSlot[];
  atNight: boolean;
  lessonDetails: { start: string | null; slotId: number | null };
  setLessonDetails: (start: string, slotId: number) => void;
}> = ({ slots, atNight, lessonDetails, setLessonDetails }) => {
  const intl = useFormatMessage();
  // const [selectedSlotDetails, setSelectedSlotDetails] = useState<{
  //   id: number;
  //   start: string;
  // } | null>(null);

  return (
    <div className="[direction:rtl] flex flex-col gap-2">
      <div className="flex gap-1 items-center">
        {atNight ? (
          <SunFog className="w-4 h-4 [&>*]:stroke-[#292D32]" />
        ) : (
          <Sun className="w-4 h-4 [&>*]:stroke-[#292D32]" />
        )}
        <Typography tag="p" className="text-tiny font-bold">
          {atNight
            ? intl("book-lesson.labels.pm")
            : intl("book-lesson.labels.am")}
        </Typography>
      </div>
      <div>
        <div className={cn({ grid: !isEmpty(slots) }, "grid-cols-3 gap-2")}>
          {isEmpty(slots) ? (
            <Typography
              tag="p"
              className="text-caption font-semibold text-center my-6"
            >
              {intl("book-lesson.empty-slots-at-this-time")}
            </Typography>
          ) : null}

          {slots.map((slot, i) => {
            const isSelected =
              lessonDetails.slotId === slot.parent &&
              lessonDetails.start === slot.start;

            return (
              <Button
                key={i}
                size="custom"
                variant={isSelected ? "primary" : "secondary"}
                type={isSelected ? "main" : "natural"}
                className={cn(
                  "w-full h-[37px] !rounded-[4px]",
                  isSelected ? "border-brand-500" : "!border-natural-200"
                )}
                onClick={() => {
                  setLessonDetails(slot.start, slot.parent);
                }}
              >
                <Typography tag="p" className="text-caption font-normal">
                  {dayjs(slot.start).format("hh:mm")}
                </Typography>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LessonDuration: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "border border-natural-200 rounded-lg bg-natural-0 py-2",
        "flex items-center justify-center"
      )}
    >
      <Typography tag="span" className="text-extra-tiny">
        {intl("book-lesson.durations.30-minutes")}
      </Typography>
    </div>
  );
};

const Divider: React.FC = () => {
  return <div className="w-full border-b border-natural-100" />;
};
