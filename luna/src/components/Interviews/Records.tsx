import React, { useMemo } from "react";
import { Calendar, User as UserIcon } from "react-feather";
import dayjs from "@/lib/dayjs";
import { IconField } from "@/components/IconField";
import { RawHtml } from "../RawHtml";
import { useFormatMessage } from "@/hooks";

export const List: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ul className="tw-flex tw-flex-col tw-gap-3">{children}</ul>;
};

export const User: React.FC<{ name: string | null }> = ({ name }) => {
  return <IconField Icon={UserIcon}>{name}</IconField>;
};

export const Date: React.FC<{ start: string }> = ({ start }) => {
  return (
    <IconField Icon={Calendar}>
      {dayjs(start).format("dddd، DD MMMM، YYYY")} ({dayjs(start).fromNow()})
    </IconField>
  );
};

export const Time: React.FC<{ start: string }> = ({ start }) => {
  return <IconField Icon={Calendar}>{dayjs(start).format("h:mm a")}</IconField>;
};

export const Feedback: React.FC<{
  tutor: boolean;
  feedback: string | null;
}> = ({ tutor, feedback }) => {
  const intl = useFormatMessage();
  const title = useMemo(
    () =>
      intl(
        tutor
          ? "page.interviews.tutor.feedback"
          : "page.interviews.interviewer.feedback"
      ),
    [intl, tutor]
  );
  if (!feedback) return null;

  return (
    <div className="tw-border tw-border-border-overlay tw-rounded-md tw-w-full">
      <p className="tw-bg-surface-300 tw-px-3 tw-py-1.5">{title}</p>
      <div className="tw-py-2 tw-px-3">
        <RawHtml html={feedback} />
      </div>
    </div>
  );
};
