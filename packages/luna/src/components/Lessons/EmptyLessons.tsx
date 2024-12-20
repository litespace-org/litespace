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
      <EmptyLessonsImage className="tw-mb-8" />
      <div className="tw-flex tw-flex-col tw-gap-4 tw-mb-6">
        <Typography
          element="subtitle-1"
          weight="bold"
          className="tw-text-natural-950"
        >
          {intl("lessons.empty")}
        </Typography>
        <Typography
          element="body"
          weight="semibold"
          className="tw-text-natural-800"
        >
          {intl("lessons.empty.find-tutors")}
        </Typography>
      </div>
      <Link
        className="tw-px-8 tw-py-4 tw-rounded-lg tw-bg-brand-700"
        to={tutorsPage}
      >
        <Typography element="body" weight="bold" className="tw-text-natural-50">
          {intl("lessons.button.find-tutors")}
        </Typography>
      </Link>
    </div>
  );
};
