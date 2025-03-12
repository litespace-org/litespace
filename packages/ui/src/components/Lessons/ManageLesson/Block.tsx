import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import SmsTracking from "@litespace/assets/SmsTracking";
import Calendar from "@litespace/assets/Calendar";
import { Void } from "@litespace/types";
import { Button } from "@/components/Button";
import { LocalId } from "@/locales";

type DialogData = {
  icon: React.FC<{ className?: string }>;
  title: LocalId;
  description: LocalId;
  action: LocalId;
};

export const Block: React.FC<{
  type: "unverified" | "has-booked";
  submit?: Void;
  close: Void;
}> = ({ type, submit, close }) => {
  const intl = useFormatMessage();

  const data: DialogData = useMemo(() => {
    if (type === "unverified")
      return {
        icon: SmsTracking,
        title: "book-lesson.not-verified.title",
        description: "book-lesson.not-verified.description",
        action: "book-lesson.not-verified.action",
      };
    return {
      icon: Calendar,
      title: "book-lesson.has-booked-lessons.title",
      description: "book-lesson.has-booked-lessons.description",
      action: "book-lesson.has-booked-lessons.action",
    };
  }, [type]);

  return (
    <div className="px-4 md:px-0 md:w-[580px]">
      <div className="w-12 h-12 flex items-center justify-center bg-brand-50 rounded-full">
        <div className="w-7 h-7 flex items-center justify-center bg-brand-100 rounded-full ">
          {<data.icon className="[&>*]:stroke-brand-700 w-6 h-6" />}
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-4 mb-6">
        <Typography
          tag="p"
          className="text-body font-semibold text-natural-950"
        >
          {intl(data.title)}
        </Typography>
        <Typography tag="p" className="text-caption text-natural-700">
          {intl(data.description)}
        </Typography>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="large"
          onClick={type === "unverified" ? submit : close}
          className="w-full whitespace-nowrap"
        >
          {intl(data.action)}
        </Button>

        {type === "unverified" ? (
          <Button
            variant="secondary"
            onClick={close}
            size="large"
            className="w-full"
          >
            {intl("global.labels.cancel")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
