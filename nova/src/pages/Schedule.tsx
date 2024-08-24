import React, { useCallback, useEffect, useState } from "react";
import { Button, Calendar, Event, messages } from "@litespace/luna";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/redux/store";
import { first, groupBy } from "lodash";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { userRulesSelector } from "@/redux/user/schedule";
import dayjs, { Dayjs } from "dayjs";
import { unpackRules } from "@litespace/sol";
import { nameof, withDevLog } from "@/lib/log";

const Schedule: React.FC = () => {
  const intl = useIntl();
  const rules = useAppSelector(userRulesSelector.full);
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  const unpack = useCallback(
    (week: Dayjs) => {
      if (!rules.value) return [];
      const ruleMap = groupBy(rules.value, "id");
      const start = week.utc().toISOString();
      const end = week.utc().add(7, "days").toISOString();
      withDevLog({ src: nameof(unpack), start, end });
      const events = unpackRules({ rules: rules.value, calls: [], start, end });
      setEvents(
        events.map((event) => {
          const rules = ruleMap[event.id];
          const rule = first(rules);
          const title = rule ? rule.title : "";
          return {
            id: event.id,
            start: event.start,
            end: event.end,
            title,
          };
        })
      );
    },
    [rules.value]
  );

  useEffect(() => {
    unpack(dayjs().startOf("week"));
  }, [unpack]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto overflow-hidden px-4 pb-36 pt-10">
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl mb-5">
          {intl.formatMessage({
            id: messages["global.labels.my-schedule"],
          })}
        </h1>

        <div>
          <Button onClick={() => navigate(Route.EditSchedule)}>
            {intl.formatMessage({
              id: messages["global.labels.edit"],
            })}
          </Button>
        </div>
      </div>

      <Calendar
        loading={rules.loading}
        events={events}
        onNextWeek={unpack}
        onPrevWeek={unpack}
      />
    </div>
  );
};

export default Schedule;
