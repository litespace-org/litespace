import React, { useCallback, useMemo } from "react";
import Title from "@/components/TutorProfile/Title";
import { ActivityGrid, ActivityMap, GridDay } from "@litespace/ui/ActivityGrid";
import { useWebFormatMessage } from "@/hooks/intl";
import { UseQueryResult } from "@tanstack/react-query";
import { ITutor } from "@litespace/types";
import { entries } from "lodash";

type BaseData = { lessonCount: number };
type ActivitiesOverviewMap = ActivityMap<BaseData>;
type GridDayData = GridDay<BaseData>;

const ActivitiesOverview: React.FC<{
  query: UseQueryResult<ITutor.FindTutorActivityScores | null, Error>;
}> = ({ query }) => {
  const intl = useWebFormatMessage();
  const activityMap = useMemo(() => {
    if (!query.data) return {};

    return entries(query.data).reduce(
      (map: ActivitiesOverviewMap, [date, { score, lessonCount }]) => {
        map[date] = { score, lessonCount };
        return map;
      },
      {}
    );
  }, [query.data]);

  const asLessonCountLabel = useCallback(
    (lessonCount: number) => {
      if (lessonCount === 0) return null;
      if (lessonCount === 1) return intl("labels.activity.lesson");
      if (lessonCount === 2) return intl("labels.activity.two.lessons");
      return intl("labels.activity.many.lessons", {
        count: lessonCount,
      });
    },
    [intl]
  );

  const tooltip = useCallback(
    (day: GridDayData) => {
      const lessonCount = day.value?.lessonCount;
      return (
        <div>
          <div>
            <span>{day.date.format("dddd, DD MMMM, YYYY")}</span>
          </div>

          {lessonCount ? (
            <div>
              <span>{asLessonCountLabel(lessonCount)}</span>
            </div>
          ) : null}
        </div>
      );
    },
    [asLessonCountLabel]
  );

  return (
    <div>
      <Title id="labels.activity" />
      <div className="lg:max-w-[42rem] xl:max-w-fit">
        <ActivityGrid map={activityMap} tooltip={tooltip} />
      </div>
    </div>
  );
};

export default ActivitiesOverview;
