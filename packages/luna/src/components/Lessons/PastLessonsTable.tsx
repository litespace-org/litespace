import { useFormatMessage } from "@/hooks";
import React, { useMemo } from "react";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import dayjs from "@/lib/dayjs";
import { isEmpty } from "lodash";
import EmptyLessons from "@litespace/assets/EmptyLesson2";
import { Link } from "react-router-dom";

export type Props = {
  lessons: Array<{
    id: number;
    start: string;
    duration: number;
    tutor: {
      id: number;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  onRebook?: (tutorId: number) => void;
  tutorsRoute: string;
};

export const PastLessonsTable: React.FC<Props> = ({
  lessons,
  tutorsRoute,
  onRebook,
}) => {
  const intl = useFormatMessage();

  const columns = useMemo(
    () => [
      intl("student-dashboard.table.date"),
      intl("student-dashboard.table.duration"),
      intl("student-dashboard.table.tutor"),
    ],
    [intl]
  );

  return (
    <div>
      <div className="tw-grid tw-grid-cols-4 tw-pb-2 tw-border-b tw-border-natural-500 tw-mb-6">
        {columns.map((column) => (
          <div key={column} className="tw-text-start tw-col-span-1">
            <Typography element="caption" className="tw-text-natural-600">
              {column}
            </Typography>
          </div>
        ))}
      </div>

      {isEmpty(lessons) ? (
        <div className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-20">
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-6">
            <Typography element="h4" weight="semibold">
              {intl("student-dashboard.table.empty")}
            </Typography>
            <Link to={tutorsRoute}>
              <Button size={ButtonSize.Small}>
                {intl("student-dashboard.table.search-tutors")}
              </Button>
            </Link>
          </div>
          <div>
            <EmptyLessons />
          </div>
        </div>
      ) : (
        <div className="tw-grid tw-grid-cols-4">
          {lessons.map((lesson) => (
            <React.Fragment key={lesson.id}>
              <div className="tw-text-start">
                <Typography element="body" className="tw-text-natural-950">
                  {dayjs(lesson.start).format("dddd - DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="tw-text-start">
                <Typography element="body" className="tw-text-natural-950">
                  {formatMinutes(lesson.duration)}
                </Typography>
              </div>
              <div className="tw-mb-4">
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <div className="tw-w-10 tw-h-10 tw-rounded-full tw-overflow-hidden">
                    <Avatar
                      src={orUndefined(lesson.tutor.imageUrl)}
                      alt={orUndefined(lesson.tutor.name)}
                      seed={lesson.tutor.id.toString()}
                    />
                  </div>
                  <Typography className="tw-text-natural-950">
                    {lesson.tutor.name}
                  </Typography>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => onRebook && onRebook(lesson.tutor.id)}
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Tiny}
                >
                  {intl("student-dashboard.table.rebook")}
                </Button>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
