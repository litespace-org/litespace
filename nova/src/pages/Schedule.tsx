import React, { useMemo } from "react";
import { Button, Calendar, messages } from "@litespace/luna";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { userRulesSelector } from "@/redux/user/schedule";
import { useCalendarEvents } from "@/hooks/event";

const Schedule: React.FC = () => {
  const intl = useIntl();
  const rules = useAppSelector(userRulesSelector.full);
  const navigate = useNavigate();
  const { events, unapckWeek } = useCalendarEvents(
    useMemo(() => ({ rules: rules.value || [] }), [rules.value])
  );

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
        onNextWeek={unapckWeek}
        onPrevWeek={unapckWeek}
      />
    </div>
  );
};

export default Schedule;
