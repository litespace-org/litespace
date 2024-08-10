import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import React from "react";
import { useMutation, useQuery } from "react-query";
import cn from "classnames";
import { splitSlot } from "@litespace/sol";
import { ICall } from "@litespace/types";

const TutorOnboarding: React.FC = () => {
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

  if (interviewer.isLoading) return <p>Loading..</p>;
  if (interviewer.isError) return <p>Error!!</p>;
  if (!interviewer.data) return;

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 font-cairo">
      <div className="flex flex-row gap-10">
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

        <div className="w-full">
          {slots.isLoading ? (
            <p>Loading...</p>
          ) : slots.error ? (
            <p>Error!!</p>
          ) : slots.data ? (
            <div
              className={cn(
                "max-h-[900px] overflow-y-scroll w-full pr-10",
                "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 active:scrollbar-track-gray-300 hover:scrollbar-track-gray-400 scrollbar-thumb-rounded-full"
              )}
            >
              <div>
                {slots.data.map(({ day, slots }) => {
                  if (isEmpty(slots)) return;
                  return (
                    <div key={day} className="mb-4">
                      <p className="text-xl font-medium mb-3">
                        {dayjs(day).format("dddd، DD MMMM، YYYY")}
                      </p>

                      <ul className="flex flex-col gap-5 w-fit">
                        {slots.map((slot) => (
                          <li key={day + slot.id + slot.start}>
                            <div
                              className={cn(
                                "mb-4 text-xl italic font-semibold"
                              )}
                            >
                              <span className="inline-block">
                                {dayjs(slot.start).format("hh:mm a")}
                              </span>
                              <span className="inline-block">&larr;</span>
                              <span className="inline-block">
                                {dayjs(slot.end).format("hh:mm a")}
                              </span>
                            </div>

                            <ul className="pr-10 flex flex-col gap-4">
                              {splitSlot(slot, 30).map((slot) => (
                                <li
                                  aria-disabled={mutation.isLoading}
                                  key={`splitted-solt-${slot.start}`}
                                  className={cn(
                                    "flex items-center justify-center rounded-lg shadow-lg hover:shadow-xl gap-2",
                                    "bg-gray-100 px-4 py-3 cursor-pointer transition-shadow duration-150 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                                  )}
                                  onClick={() =>
                                    mutation.mutate({
                                      duration: 30,
                                      slotId: slot.id,
                                      start: slot.start,
                                      type: ICall.Type.Interview,
                                    })
                                  }
                                >
                                  <span>↲</span>
                                  <span className="inline-block">
                                    {dayjs(slot.start).format("hh:mm a")}
                                  </span>
                                  <span className="inline-block">&larr;</span>
                                  <span className="inline-block">
                                    {dayjs(slot.end).format("hh:mm a")}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TutorOnboarding;
