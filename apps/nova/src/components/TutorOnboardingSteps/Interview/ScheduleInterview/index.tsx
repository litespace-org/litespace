import { IInterview, IRule, IUser } from "@litespace/types";
import { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "@/lib/dayjs";
import {
  Button,
  ButtonType,
  DatePicker,
  messages,
  toaster,
  asFullAssetUrl,
  atlas,
} from "@litespace/luna";
import cn from "classnames";
import { useIntl } from "react-intl";
import { flatten } from "lodash";
import { splitRuleEvent } from "@litespace/sol";

const WINDOW = 30;

const ScheduleInterview: React.FC<{
  interviewer: IUser.Self;
  onSuccess(): void;
}> = ({ interviewer, onSuccess }) => {
  const intl = useIntl();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [selectedRule, setSelectedRule] = useState<IRule.RuleEvent | null>(
    null
  );

  const start = useMemo(() => dayjs(), []);
  const end = useMemo(() => start.add(WINDOW, "days"), [start]);

  const rules = useQuery({
    queryKey: ["interviewer-slots"],
    queryFn: async () => {
      return atlas.rule.findUnpackedUserRules(
        interviewer.id,
        start.utc().format("YYYY-MM-DD"),
        end.utc().format("YYYY-MM-DD")
      );
    },
  });

  const dayRules: IRule.RuleEvent[] = useMemo(() => {
    if (!rules.data) return [];
    return rules.data.unpacked.filter((rule) =>
      dayjs(rule.start).isSame(date, "day")
    );
  }, [date, rules.data]);

  const mutation = useMutation({
    mutationFn: (payload: IInterview.CreateApiPayload) =>
      atlas.interview.create(payload),
    onSuccess() {
      onSuccess();
      rules.refetch();
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

  const selectableEvents: IRule.RuleEvent[] = useMemo(() => {
    return flatten(dayRules.map((rule) => splitRuleEvent(rule, 30)));
  }, [dayRules]);

  return (
    <div>
      <div className="flex flex-row gap-12 mt-5">
        <div className="flex flex-col gap-3 w-[300px]">
          <div className="rounded-3xl overflow-hidden">
            {interviewer.image && (
              <img
                className="w-full h-full"
                src={asFullAssetUrl(interviewer.image)}
                alt={interviewer.name || "Interviewer"}
              />
            )}
          </div>

          <div>
            <p className="font-cairo font-bold text-2xl">{interviewer.name}</p>
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
              "w-full flex flex-col gap-3 h-[400px] overflow-y-scroll relative pl-4 pb-4",
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
      <div className="w-[250px] mt-12">
        <Button
          onClick={() => {
            if (!selectedRule) return;
            mutation.mutate({
              interviewerId: interviewer.id,
              ruleId: selectedRule.id,
              start: selectedRule.start,
            });
          }}
          disabled={!selectedRule || mutation.isPending}
          loading={mutation.isPending}
        >
          <span className="truncate">
            {intl.formatMessage(
              {
                id: messages[
                  "page.tutor.onboarding.book.interview.button.label"
                ],
              },
              { name: interviewer.name }
            )}
          </span>
        </Button>
      </div>{" "}
    </div>
  );
};

export default ScheduleInterview;
