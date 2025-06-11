import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useMemo, useState } from "react";
import { MonthlyCalendar } from "@litespace/ui/MonthlyCalendar";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { Button } from "@litespace/ui/Button";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { IAvailabilitySlot, Void } from "@litespace/types";
import {
  getSubSlotsBatch as getSubSlots,
  orderSlots,
  subtractSlotsBatch as subtractSlots,
} from "@litespace/utils/availabilitySlots";
import { INTERVIEW_DURATION } from "@litespace/utils/constants";
import { concat } from "lodash";
import cn from "classnames";
import { useCreateInterview } from "@litespace/headless/interviews";
import { useOnError } from "@/hooks/error";
import { useToast } from "@litespace/ui/Toast";

type Step = "date-selection" | "time-selection";

const TimingSelection: React.FC<{
  slots: IAvailabilitySlot.Self[];
  bookedSlots: IAvailabilitySlot.SubSlot[];
  sync: Void;
  syncing: boolean;
}> = ({ slots, bookedSlots, sync, syncing }) => {
  const toast = useToast();
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [selectedSubSlot, setSelectedSubSlot] =
    useState<IAvailabilitySlot.SubSlot | null>(null);

  const unbookedSlots = useMemo(
    () => subtractSlots({ slots, subslots: bookedSlots }),
    [bookedSlots, slots]
  );

  const selectDaySlots = useCallback(
    (day: Dayjs) => {
      const daySlots = unbookedSlots.filter(
        (event) =>
          day.isSame(event.start, "day") || day.isSame(event.end, "day")
      );
      return getSubSlots(daySlots, INTERVIEW_DURATION);
    },
    [unbookedSlots]
  );

  /**
   * List of all slots including booked and unbooked slots.
   */
  const selectedDaySlots = useMemo(() => {
    const availableSlots = selectDaySlots(date).map((slot) => ({
      ...slot,
      bookable: dayjs(slot.start).isAfter(dayjs()),
    }));

    return orderSlots(
      concat(
        availableSlots,
        bookedSlots.map((slot) => ({ ...slot, bookable: false }))
      ),
      "asc"
    );
  }, [selectDaySlots, date, bookedSlots]);

  const onError = useOnError({
    type: "mutation",
    handler({ messageId }) {
      toast.error({
        title: intl("tutor-onboarding.step.interview.confirm-error"),
        description: intl(messageId),
      });
    },
  });

  const create = useCreateInterview({
    onError,
    onSuccess() {
      sync();
    },
  });

  return (
    <div className="flex flex-col items-center justify-center w-[564px]">
      <Typography tag="h5" className="text-subtitle-2 font-bold mb-6">
        {intl("tutor-onboarding.step.interview.timing-selection.title")}
      </Typography>

      {step === "date-selection" ? (
        <DateSelection selected={date} select={setDate} />
      ) : null}
      {step === "time-selection" ? (
        <TimeSelection
          slots={selectedDaySlots}
          select={setSelectedSubSlot}
          start={selectedSubSlot?.start}
        />
      ) : null}

      <Actions
        step={step}
        setStep={setStep}
        confirm={() => {
          if (!selectedSubSlot) return;
          create.mutate({
            slotId: selectedSubSlot.parent,
            start: selectedSubSlot.start,
          });
        }}
        confirming={create.isPending}
        disabled={create.isPending || syncing}
      />
    </div>
  );
};

const DateSelection: React.FC<{
  selected: Dayjs;
  select(day: Dayjs): void;
}> = ({ selected, select }) => {
  return (
    <div className="w-full">
      <MonthlyCalendar selected={selected} select={select} min={dayjs()} />
    </div>
  );
};

const TimeSelection: React.FC<{
  slots: Array<IAvailabilitySlot.SubSlot & { bookable: boolean }>;
  start?: string;
  select(subslot: IAvailabilitySlot.SubSlot): void;
}> = ({ slots, start, select }) => {
  return (
    <ul className="flex flex-row gap-3 flex-wrap items-center justify-start">
      {slots.map((slot) => (
        <button
          type="button"
          key={slot.start}
          data-selected={start === slot.start}
          disabled={!slot.bookable}
          className={cn(
            "w-20 h-20 border border-natural-200 rounded-lg flex items-center justify-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            "data-[selected=false]:hover:bg-brand-100 data-[selected=true]:bg-brand-700 data-[selected=true]:border-brand-800",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() =>
            select({ start: slot.start, end: slot.end, parent: slot.parent })
          }
        >
          <Typography
            tag="p"
            data-selected={start === slot.start}
            className="text-tiny text-natural-700 data-[selected=true]:text-natural-50"
          >
            {dayjs(slot.start).format("hh:mm a")}
          </Typography>
        </button>
      ))}
    </ul>
  );
};

const Actions: React.FC<{
  step: Step;
  setStep(step: Step): void;
  confirm: Void;
  disabled: boolean;
  confirming: boolean;
}> = ({ step, setStep, confirm, disabled, confirming }) => {
  const intl = useFormatMessage();
  return (
    <div className="mt-10 w-full flex flex-row gap-3">
      <Button
        endIcon={<ArrowLeft className="icon" />}
        className={cn(
          "min-w-32",
          step === "date-selection" ? "block" : "hidden"
        )}
        size="large"
        onClick={() => setStep("time-selection")}
        disabled={disabled}
      >
        {intl("labels.next")}
      </Button>
      <Button
        startIcon={<ArrowRight className="icon" />}
        className={cn(
          "min-w-32",
          step === "time-selection" ? "block" : "hidden"
        )}
        size="large"
        onClick={() => setStep("date-selection")}
        disabled={disabled || confirming}
      >
        {intl("labels.prev")}
      </Button>
      <Button
        className={cn(
          "min-w-32",
          step === "time-selection" ? "block" : "hidden"
        )}
        size="large"
        onClick={confirm}
        disabled={disabled || confirming}
        loading={confirming}
      >
        {intl("labels.confirm")}
      </Button>
    </div>
  );
};

export default TimingSelection;
