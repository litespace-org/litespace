import { IInterview, ISlot, IUser } from "@litespace/types";
import { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import dayjs from "@/lib/dayjs";
import { asAssetUrl } from "@litespace/atlas";
import { atlas, backend } from "@/lib/atlas";
import {
  Button,
  ButtonType,
  DatePicker,
  messages,
  toaster,
} from "@litespace/luna";
import cn from "classnames";
import { splitSlot } from "@litespace/sol";
import { flatten } from "lodash";
import { useIntl } from "react-intl";

const WINDOW = 30;

const ScheduleInterview: React.FC<{
  interviewer: IUser.Self;
  onSuccess(): void;
}> = ({ interviewer, onSuccess }) => {
  const intl = useIntl();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<ISlot.Discrete | null>(null);

  const start = useMemo(() => dayjs(), []);
  const end = useMemo(() => start.add(WINDOW, "days"), [start]);

  const slots = useQuery({
    queryKey: "interviewer-slots",
    queryFn: async () => {
      return await atlas.slot.findDiscreteTimeSlots(interviewer.id, {
        start: start.format("YYYY-MM-DD"),
        window: WINDOW,
      });
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: IInterview.CreateApiPayload) =>
      atlas.interview.create(payload),
    onSuccess() {
      onSuccess();
      slots.refetch();
      toaster.success({
        title: intl.formatMessage({
          id: messages["page.tutor.onboarding.book.interview.success.title"],
        }),
      });
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["page.tutor.onboarding.book.interview.fail.title"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const daySlots: ISlot.Discrete[] = useMemo(() => {
    if (!slots.data) return [];
    return slots.data.find((slot) => date.isSame(slot.day, "day"))?.slots ?? [];
  }, [date, slots.data]);

  const selectableSlots = useMemo(() => {
    if (!daySlots) return [];
    return flatten(daySlots.map((slot) => splitSlot(slot)));
  }, [daySlots]);

  console.log({ slots: slots.data });

  return (
    <div>
      <div className="flex flex-row gap-12 mt-5">
        <div className="flex flex-col gap-3 w-[300px]">
          <div className="rounded-3xl overflow-hidden">
            {interviewer.photo && (
              <img
                className="w-full h-full"
                src={asAssetUrl(backend, interviewer.photo)}
                alt={interviewer.name.ar || "Interviewer"}
              />
            )}
          </div>

          <div>
            <p className="font-cairo font-bold text-2xl">
              {interviewer.name.ar}
            </p>
          </div>
        </div>

        <DatePicker
          min={start}
          max={end.subtract(1, "day")}
          selected={date}
          onSelect={(date) => setDate(dayjs(date.format("YYYY-MM-DD")))}
          disable={mutation.isLoading || slots.isLoading}
        />

        <div className="flex flex-col w-[300px]">
          <h3 className="text-2xl mb-[20px]">
            {date.format("dddd, DD MMMM, YYYY")}
          </h3>

          <ul
            className={cn(
              "w-full flex flex-col gap-3 h-[400px] overflow-y-scroll relative pl-4 pb-4",
              "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
            )}
          >
            {selectableSlots
              .filter((slot) => dayjs(slot.start).isAfter(dayjs(), "minutes"))
              .map((slot) => {
                return (
                  <li key={slot.start}>
                    <Button
                      onClick={() => setSelectedSlot(slot)}
                      type={
                        selectedSlot &&
                        dayjs(slot.start).isSame(selectedSlot.start, "minutes")
                          ? ButtonType.Primary
                          : ButtonType.Secondary
                      }
                      disabled={mutation.isLoading || slots.isFetching}
                    >
                      {dayjs(slot.start).format("hh:mm a")}
                    </Button>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className="w-[250px] mt-12">
        <Button
          onClick={() => {
            if (!selectedSlot) return;
            mutation.mutate({
              interviewerId: interviewer.id,
              call: { slotId: selectedSlot.id, start: selectedSlot.start },
            });
          }}
          disabled={!selectedSlot || mutation.isLoading}
          loading={mutation.isLoading}
        >
          <span className="truncate">
            {intl.formatMessage(
              {
                id: messages[
                  "page.tutor.onboarding.book.interview.button.label"
                ],
              },
              { name: interviewer.name.ar }
            )}
          </span>
        </Button>
      </div>{" "}
    </div>
  );
};

export default ScheduleInterview;
