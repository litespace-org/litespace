import { IInterview, IRule } from "@litespace/types";
import { Dayjs } from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "@/lib/dayjs";
import {
  Button,
  ButtonType,
  DatePicker,
  toaster,
  asFullAssetUrl,
  atlas,
  useFormatMessage,
  Loading,
  ButtonSize,
} from "@litespace/luna";
import cn from "classnames";
import { flatten } from "lodash";
import { splitRuleEvent } from "@litespace/sol";

const WINDOW = 30;

const ScheduleInterview: React.FC<{
  onSuccess(): void;
}> = ({ onSuccess }) => {
  const intl = useFormatMessage();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [selectedRule, setSelectedRule] = useState<IRule.RuleEvent | null>(
    null
  );

  const start = useMemo(() => dayjs(), []);
  const end = useMemo(() => start.add(WINDOW, "days"), [start]);

  const selectInterviewer = useCallback(async () => {
    return atlas.user.selectInterviewer();
  }, []);

  const interviewer = useQuery({
    queryFn: selectInterviewer,
    queryKey: ["select-interviewer"],
  });

  const findUnpackedUserRoles = useCallback(async () => {
    if (!interviewer.data) return;
    return atlas.rule.findUnpackedUserRules(
      interviewer.data.id,
      start.utc().format("YYYY-MM-DD"),
      end.utc().format("YYYY-MM-DD")
    );
  }, [end, interviewer.data, start]);

  const rules = useQuery({
    queryFn: findUnpackedUserRoles,
    queryKey: ["interviewer-slots"],
    enabled: !!interviewer.data,
  });

  const dayRules: IRule.RuleEvent[] = useMemo(() => {
    if (!rules.data) return [];
    return rules.data.unpacked.filter((rule) =>
      dayjs(rule.start).isSame(date, "day")
    );
  }, [date, rules.data]);

  const createInterview = useCallback(
    async (payload: IInterview.CreateApiPayload) => {
      return atlas.interview.create(payload);
    },
    []
  );

  const mutation = useMutation({
    mutationFn: createInterview,
    onSuccess() {
      onSuccess();
      rules.refetch();
      toaster.success({
        title: intl("page.tutor.onboarding.book.interview.success.title"),
      });
    },
    onError(error) {
      toaster.error({
        title: intl("page.tutor.onboarding.book.interview.fail.title"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const selectableEvents: IRule.RuleEvent[] = useMemo(() => {
    return flatten(dayRules.map((rule) => splitRuleEvent(rule, 30)));
  }, [dayRules]);

  if (interviewer.isLoading || rules.isLoading)
    return <Loading className="h-[30vh]" />;

  // todo: ui required
  if (interviewer.error || rules.error) return <h1>Error!!</h1>;
  if (!interviewer.data) return null;

  return (
    <div>
      <div className="flex flex-row gap-12 mt-5">
        <div className="flex flex-col gap-3 w-[300px]">
          <div className="rounded-3xl overflow-hidden">
            <img
              className="w-full h-full"
              src={
                interviewer.data.image
                  ? asFullAssetUrl(interviewer.data.image)
                  : "/avatar-1.png"
              }
              alt={interviewer.data.name || "Interviewer"}
            />
          </div>

          <div>
            <p className="font-cairo font-bold text-2xl">
              {interviewer.data.name}
            </p>
          </div>
        </div>

        <DatePicker
          min={start}
          max={end.subtract(1, "day")}
          selected={date}
          onSelect={(date) => setDate(dayjs(date.format("YYYY-MM-DD")))}
          disable={mutation.isPending || rules.isLoading}
        />

        <div className="flex flex-col w-[300px]">
          <h3 className="text-2xl mb-[20px]">
            {date.format("dddd, DD MMMM, YYYY")}
          </h3>

          <ul
            className={cn(
              "w-full flex flex-col gap-3 h-full max-h-[400px] overflow-y-scroll relative pl-4 pb-4",
              "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
            )}
          >
            {selectableEvents
              .filter((event) =>
                dayjs.utc(event.start).isAfter(dayjs.utc(), "minutes")
              )
              .map((event) => {
                return (
                  <li key={event.start}>
                    <Button
                      size={ButtonSize.Small}
                      onClick={() => setSelectedRule(event)}
                      type={
                        selectedRule &&
                        dayjs(event.start).isSame(selectedRule.start, "minutes")
                          ? ButtonType.Primary
                          : ButtonType.Secondary
                      }
                      disabled={mutation.isPending || rules.isFetching}
                    >
                      {dayjs(event.start).format("hh:mm a")}
                    </Button>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      <Button
        className="mt-5"
        onClick={() => {
          if (!selectedRule) return;
          mutation.mutate({
            interviewerId: interviewer.data.id,
            ruleId: selectedRule.id,
            start: selectedRule.start,
          });
        }}
        disabled={!selectedRule || mutation.isPending}
        loading={mutation.isPending}
        size={ButtonSize.Small}
      >
        <span className="truncate">
          {intl("page.tutor.onboarding.book.interview.button.label")}
        </span>
      </Button>
    </div>
  );
};

export default ScheduleInterview;
