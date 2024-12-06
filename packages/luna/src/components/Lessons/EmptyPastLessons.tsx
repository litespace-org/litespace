import EmptyLessons from "@litespace/assets/EmptyLessons";
import React from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Link } from "react-router-dom";
import cn from "classnames";

const EmptyPastLessons: React.FC<{ className?: string }> = ({ className }) => {
  const intl = useFormatMessage();
  return (
    <div className={cn("tw-flex tw-items-center tw-gap-[10vw]", className)}>
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-6">
        <Typography
          element="h4"
          weight="semibold"
          className="tw-text-natural-950"
        >
          {intl("lessons.empty-past-lessons")}
        </Typography>
        <Link
          to="/tutors"
          className="tw-inline-block tw-px-6 tw-py-3 tw-rounded-lg tw-bg-brand-700"
        >
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("lessons.button.find-tutors")}
          </Typography>
        </Link>
      </div>
      <EmptyLessons />
    </div>
  );
};

export default EmptyPastLessons;
