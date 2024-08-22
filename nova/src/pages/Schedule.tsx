import React, { useMemo } from "react";
import { Button, Calendar, Event, messages } from "@litespace/luna";
import { useIntl } from "react-intl";
import { useQuery } from "react-query";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import dayjs from "@/lib/dayjs";
import { first, groupBy } from "lodash";

const Schedule: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);

  const rules = useQuery({
    queryFn: () => {
      if (!profile) return null;
      const start = dayjs.utc().startOf("day");
      return atlas.rule.findUnpackedUserRules(
        profile.id,
        start.format("YYYY-MM-DD"),
        start.add(30, "days").format("YYYY-MM-DD")
      );
    },
    enabled: !!profile,
  });

  const events: Event[] = useMemo((): Event[] => {
    if (!rules.data) return [];
    const ruleMap = groupBy(rules.data.rules, "id");

    return rules.data.unpacked.map((event) => {
      const rules = ruleMap[event.id];
      const rule = first(rules);
      const title = rule ? rule.title : "";
      return {
        id: event.id,
        start: event.start,
        end: event.end,
        title,
      };
    });
  }, [rules.data]);

  return (
    <div className="w-full overflow-hidden max-w-screen-2xl mx-auto px-4 pb-12 pt-10">
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl mb-5">
          {intl.formatMessage({
            id: messages["global.labels.my-schedule"],
          })}
        </h1>

        <div>
          <Button>
            {intl.formatMessage({
              id: messages["global.labels.edit"],
            })}
          </Button>
        </div>
      </div>

      <Calendar events={events} />
    </div>
  );
};

export default Schedule;
