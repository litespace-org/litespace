import React, { useMemo } from "react";
import { Button, ButtonSize } from "@litespace/luna/components/Button";
import { Calendar } from "@litespace/luna/components/Calendar";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
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
    <div className="w-full p-6 mx-auto overflow-hidden max-w-screen-2xl">
      <div className="flex flex-row items-center justify-between">
        <h1 className="mb-5 text-4xl">{intl("global.labels.my-schedule")}</h1>

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
