import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import React from "react";
import { useQuery } from "react-query";

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

        <div>
          {slots.isLoading ? (
            <p>Loading...</p>
          ) : slots.error ? (
            <p>Error!!</p>
          ) : slots.data ? (
            <div>
              <div>
                {slots.data.map(({ day, slots }) => {
                  if (isEmpty(slots)) return;
                  return (
                    <div key={day} className="mb-4">
                      <p className="text-xl font-medium mb-3">
                        {dayjs(day).format("dddd، DD MMMM، YYYY")}
                      </p>

                      <ul className="flex flex-col gap-2 w-fit">
                        {slots.map((slot) => (
                          <li
                            key={day + slot.id + slot.start}
                            className="flex items-center justify-center rounded-lg shadow-lg hover:shadow-xl gap-2 bg-gray-100 px-4 py-3 cursor-pointer transition-shadow duration-150"
                          >
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
