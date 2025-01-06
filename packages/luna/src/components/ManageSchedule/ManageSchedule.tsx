import { Button, ButtonVariant } from "@/components/Button";
import { Dialog } from "@/components/Dialog/V2";
import { Loader, LoadingError } from "@/components/Loading";
import SlotRowContainer from "@/components/ManageSchedule/SlotRowContainer";
import { Slot } from "@/components/ManageSchedule/types";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { IAvailabilitySlot, Void } from "@litespace/types";
import cn from "classnames";
import { Dayjs } from "dayjs";
import { range } from "lodash";
import React, { useEffect, useMemo, useState } from "react";

const WEEK_DAYS = 7;

type Props = {
  initialSlots: IAvailabilitySlot.Slot[];
  save: Void;
  open: boolean;
  loading?: boolean;
  error?: boolean;
  retry: Void;
  /**
   * Schedule start time in ISO format.
   */
  start?: string;
  close: Void;
};

export const ManageSchedule: React.FC<Props> = ({
  start,
  open,
  loading,
  error,
  initialSlots,
  retry,
  save,
  close,
}) => {
  const intl = useFormatMessage();

  const [date, setDate] = useState<Dayjs>(dayjs(start).startOf("week"));
  const [slots, setSlots] = useState<Slot[]>([]);

  const days = useMemo(() => {
    return range(WEEK_DAYS).map((index) => {
      const day = date.add(index, "day").startOf("day");
      const daySlots = slots.filter((slot) => day.isSame(slot.day, "day"));
      return { day, slots: daySlots };
    });
  }, [date, slots]);

  useEffect(() => {
    setSlots(
      initialSlots.map((slot) => ({
        ...slot,
        day: dayjs(slot.start).startOf("day").toISOString(),
        state: "unchanged",
      }))
    );
  }, [initialSlots]);

  return (
    <Dialog
      open={open}
      close={close}
      title={<DialogTitle />}
      className="tw-overflow-y-auto"
    >
      <div className="tw-pt-6">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-4">
          <button
            type="button"
            onClick={() => setDate((prev) => prev.subtract(1, "week"))}
          >
            <ArrowRight className="[&>*]:tw-stroke-brand-700" />
          </button>
          <Typography
            element="body"
            weight="bold"
            className="tw-text-natural-950"
          >
            {date.format("D MMMM")} - {date.add(6, "days").format("D MMMM")}
          </Typography>
          <button
            type="button"
            onClick={() => setDate((prev) => prev.add(1, "week"))}
          >
            <ArrowLeft className="[&>*]:tw-stroke-brand-700" />
          </button>
        </div>
        <Typography
          element="body"
          weight="bold"
          className="tw-text-natural-950 tw-mb-4 tw-mt-6"
        >
          {intl("tutors.schedule.available-days")}
        </Typography>
      </div>

      <div
        className={cn(
          "tw-flex tw-flex-col tw-gap-4 tw-mb-10 tw-max-h-[548px] tw-overflow-y-auto",
          "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
        )}
      >
        {loading ? (
          <div className="tw-w-[198px] tw-mx-[175px] tw-mt-[42px] tw-mb-[72px] tw-flex tw-justify-center tw-items-center">
            <Loader
              size="medium"
              text={intl("tutors.schedule.loading.message")}
            />
          </div>
        ) : null}

        {error ? (
          <div className="tw-w-[342px] tw-mx-[103px] tw-mt-[42px] tw-mb-[72px] tw-flex tw-justify-center tw-items-center">
            <LoadingError
              size="medium"
              error={intl("tutors.schedule.error.message")}
              retry={retry}
            />
          </div>
        ) : null}

        {!loading && !error
          ? days.map(({ day, slots }) => {
              const iso = day.toISOString();
              return (
                <div className="tw-flex tw-gap-8" key={iso}>
                  <Typography
                    element="caption"
                    weight="medium"
                    className="tw-text-natural-950 tw-w-[88px]"
                  >
                    {day.format("dddd M/D")}
                  </Typography>

                  <SlotRowContainer
                    slots={slots}
                    setSlots={setSlots}
                    iso={iso}
                  />
                </div>
              );
            })
          : null}
      </div>

      <div className="tw-flex tw-gap-6 tw-mt-auto">
        <Button className="tw-grow tw-basis-1/2" onClick={save}>
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("tutors.schedule.buttons.save")}
          </Typography>
        </Button>
        <Button
          onClick={close}
          variant={ButtonVariant.Secondary}
          className="tw-grow tw-basis-1/2"
        >
          <Typography
            element="body"
            weight="semibold"
            className="text-brand-700"
          >
            {intl("global.labels.cancel")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};

const DialogTitle: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <Typography
      element="subtitle-2"
      weight="bold"
      className="tw-text-natural-950"
    >
      {intl("tutors.schedule.manage")}
    </Typography>
  );
};
