import { atlas, backend } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import {
  Button,
  ButtonType,
  DatePicker,
  messages,
  Spinner,
  toaster,
} from "@litespace/luna";
import { IInterview, ISlot } from "@litespace/types";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useMutation, useQuery } from "react-query";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { flatten } from "lodash";
import { splitSlot } from "@litespace/sol";
import { asAssetUrl } from "@litespace/atlas";
import cn from "classnames";
import { marked } from "marked";
import markdown from "@/markdown/tutorOnboarding/interview.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";

const ScheduleInterview: React.FC = () => {
  const intl = useIntl();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const profile = useAppSelector(profileSelector);
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

  const interviews = useQuery({
    queryFn: async () => {
      if (!profile) return [];
      return await atlas.interview.find(profile.id);
    },
    enabled: !!profile,
  });

  const mutation = useMutation({
    mutationFn: (payload: IInterview.CreateApiPayload) =>
      atlas.interview.create(payload),
    onSuccess() {
      interviews.refetch();
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

  const html = useMemo(() => {
    return marked.parse(
      markdown.replace(/{interviewer}/gi, interviewer.data?.name.ar || ""),
      { async: false }
    );
  }, [interviewer.data?.name.ar]);

  if (interviewer.isLoading || interviews.isLoading || slots.isLoading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    );

  return (
    <div className="pb-10 flex flex-col w-full">
      <RawHtml html={html} />
      <div className="flex flex-row gap-12 mt-5">
        <div className="flex flex-col gap-3 w-[300px]">
          <div className="rounded-3xl overflow-hidden">
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
              {interviewer.data?.name.ar}
            </p>
          </div>
        </div>

        <DatePicker
          min={dayjs()}
          max={dayjs().add(14, "days")}
          selected={date}
          onSelect={(date) => setDate(dayjs(date.format("YYYY-MM-DD")))}
          disable={mutation.isLoading}
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
            if (!selectedSlot || !interviewer.data) return;
            mutation.mutate({
              interviewerId: interviewer.data.id,
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
              { name: interviewer.data?.name.ar }
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ScheduleInterview;
