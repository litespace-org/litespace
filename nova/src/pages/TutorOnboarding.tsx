import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import dayjs from "@/lib/dayjs";
import { flatten } from "lodash";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { splitSlot } from "@litespace/sol";
import { ICall, ISlot } from "@litespace/types";
import {
  Button,
  ButtonType,
  DatePicker,
  messages,
  toaster,
} from "@litespace/luna";
import { Dayjs } from "dayjs";
import { useIntl } from "react-intl";

const TutorOnboarding: React.FC = () => {
  const intl = useIntl();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<ISlot.Discrete | null>(null);
  const interviewer = useQuery({
    queryKey: "select-interviewer",
    queryFn: () => atlas.user.selectInterviewer(),
    retry: false,
  });

  const slots = useQuery({
    queryKey: "interviewer-slots",
    queryFn: async () => {
      if (!interviewer.data) return [];
      return await atlas.slot.findDiscreteTimeSlots(interviewer.data.id);
    },
    enabled: !!interviewer.data,
  });

  const mutation = useMutation({
    mutationFn: (payload: ICall.CreateApiPayload) => atlas.call.create(payload),
    onSuccess() {
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

  if (interviewer.isLoading) return <p>Loading..</p>;
  if (interviewer.isError) return <p>Error!!</p>;
  if (!interviewer.data) return;

  return (
    <div className="py-10">
      <div className="flex gap-12">
        <div className="flex flex-col gap-3">
          <div className="w-[300px] rounded-lg overflow-hidden shadow-2xl">
            {interviewer.data?.photo && (
              <img
                className="w-full h-full"
                src={asAssetUrl(backend, interviewer.data.photo)}
                alt={interviewer.data.name.ar || "Interviewer"}
              />
            )}
          </div>

          <div>
            <p className="font-cairo font-bold text-2xl">
              {interviewer.data.name.ar}
            </p>
          </div>
        </div>

        <div>
          <DatePicker
            min={dayjs()}
            max={dayjs().add(14, "days")}
            selected={date}
            onSelect={(date) => setDate(dayjs(date.format("YYYY-MM-DD")))}
            disable={mutation.isLoading}
          />
        </div>

        <div>
          <h3 className="text-2xl mb-[20px]">
            {date.format("dddd، DD MMMM، YYYY")}
          </h3>

          <ul className="w-[200px] flex flex-col gap-3 h-[400px] overflow-y-scroll scrollbar-none relative">
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
                      disabled={mutation.isLoading}
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
              type: ICall.Type.Interview,
              slotId: selectedSlot.id,
              start: selectedSlot.start,
              duration: 30,
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
              { name: interviewer.data.name.ar }
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default TutorOnboarding;
