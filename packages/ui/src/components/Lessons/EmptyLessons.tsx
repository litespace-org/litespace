import React from "react";
import { Typography } from "@/components/Typography";
import EmptyLessonsImage from "@litespace/assets/EmptyLessons";
import { useFormatMessage } from "@/hooks";
import { Link } from "react-router-dom";

export const EmptyLessons: React.FC<{ tutorsPage: string }> = ({
  tutorsPage,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-text-center">
      <EmptyLessonsImage className="tw-mb-8 tw-w-[328px] tw-h-[211px] md:tw-w-[428px] md:tw-h-[276px]" />
      <div className="tw-flex tw-flex-col tw-gap-4 tw-mb-6">
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-subtitle-1 tw-font-bold"
        >
          {intl("lessons.empty")}
        </Typography>
        <Typography
          tag="span"
          className="tw-text-natural-800 tw-text-base tw-font-semibold"
        >
          {intl("lessons.empty.find-tutors")}
        </Typography>
      </div>
      <Link
        className="tw-px-8 tw-py-4 tw-rounded-lg tw-bg-brand-700"
        to={tutorsPage}
      >
        <Typography
          tag="span"
          className="tw-text-natural-50 tw-text-base tw-font-bold"
        >
          {intl("lessons.button.find-tutors")}
        </Typography>
      </Link>
    </div>
  );
};
