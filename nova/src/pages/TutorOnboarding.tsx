import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import dayjs from "@/lib/dayjs";
import { flatten } from "lodash";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import cn from "classnames";
import { splitSlot } from "@litespace/sol";
import { ICall, ISlot } from "@litespace/types";
import { Button, ButtonType, DatePicker } from "@litespace/luna";
import { Dayjs } from "dayjs";

const TutorOnboarding: React.FC = () => {
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
            selected={date}
            onSelect={(date) => setDate(dayjs(date.format("YYYY-MM-DD")))}
          />
        </div>

        <div>
          <h3 className="text-2xl mb-[20px]">
            {date.format("dddd، DD MMMM، YYYY")}
          </h3>

          <ul className="w-[200px] flex flex-col gap-3">
            {selectableSlots.map((slot) => {
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
                  >
                    {dayjs(slot.start).format("hh:mm a")}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TutorOnboarding;
