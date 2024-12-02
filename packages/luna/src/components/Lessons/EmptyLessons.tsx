import React from "react";
import { Typography } from "@/components/Typography";
import EmptyLessons from "@litespace/assets/EmptyLessons";
import { useFormatMessage } from "@/hooks";
import { Link } from "react-router-dom";

export const EmptyLessonsPage: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-text-center tw-mt-28">
      <EmptyLessons className="tw-mb-8" />
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
        to="/tutors"
      >
        <Typography element="body" weight="bold" className="tw-text-natural-50">
          {intl("lessons.button.find-tutors")}
        </Typography>
      </Link>
    </div>
  );
};

export default EmptyLessonsPage;
