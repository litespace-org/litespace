import React from "react";
import { Typography } from "@/components/Typography";
import EmptyLessonsImage from "@litespace/assets/EmptyLessons";
import { useFormatMessage } from "@/hooks";
import { Link } from "react-router-dom";

export const EmptyLessons: React.FC<{
  tutorsPage: string;
  isStudent: boolean;
}> = ({ tutorsPage, isStudent }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col justify-center items-center text-center">
      <EmptyLessonsImage className="mb-8 w-[328px] h-[211px] md:w-[428px] md:h-[276px]" />
      <div className="flex flex-col gap-4 mb-6">
        <Typography
          tag="span"
          className="text-natural-950 text-subtitle-1 font-bold"
        >
          {intl("lessons.empty")}
        </Typography>
        <Typography
          tag="span"
          className="text-natural-800 text-base font-semibold"
        >
          {isStudent
            ? intl("lessons.empty.find-tutors")
            : intl("lessons.empty.waiting-lessons")}
        </Typography>
      </div>
      {isStudent ? (
        <Link className="px-8 py-4 rounded-lg bg-brand-700" to={tutorsPage}>
          <Typography
            tag="span"
            className="text-natural-50 text-base font-bold"
          >
            {intl("lessons.button.find-tutors")}
          </Typography>
        </Link>
      ) : null}
    </div>
  );
};
