import React, { useMemo } from "react";
import {
  Button,
  ButtonSize,
  Calendar,
  useFormatMessage,
} from "@litespace/luna";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { userRulesSelector } from "@/redux/user/schedule";
import { useCalendarEvents } from "@/hooks/event";

const Schedule: React.FC = () => {
  const intl = useFormatMessage();
  const rules = useAppSelector(userRulesSelector.full);
  const navigate = useNavigate();
  const { events, unapckWeek } = useCalendarEvents(
    useMemo(() => ({ rules: rules.value || [] }), [rules.value])
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto overflow-hidden p-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-4xl mb-5">{intl("global.labels.my-schedule")}</h1>

        <div>
          <Button
            size={ButtonSize.Small}
            onClick={() => navigate(Route.EditSchedule)}
          >
            {intl("global.labels.edit")}
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
