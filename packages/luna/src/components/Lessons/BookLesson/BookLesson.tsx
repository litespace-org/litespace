import React, { useState } from "react";
import { Dialog } from "@/components/Dialog/V2";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/BookLesson/Stepper";
import { Step } from "@/components/Lessons/BookLesson/types";
import { DateSelection } from "@/components/Lessons/BookLesson/DateSelection";
import dayjs from "@/lib/dayjs";

export const BookLesson: React.FC<{
  open: boolean;
  close: Void;
  /**
   * Tutor name.
   */
  name: string | null;
}> = ({ open, close, name }) => {
  const intl = useFormatMessage();
  const [step] = useState<Step>("time-selection");
  return (
    <Dialog
      open={open}
      close={close}
      title={
        <Typography
          element="subtitle-2"
          weight="bold"
          className="tw-text-natural-950"
          tag="div"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
    >
      <div className="tw-mt-8">
        <Stepper step={step} />
      </div>
      <div className="tw-mt-9">
        <DateSelection selected={dayjs()} />
      </div>
    </Dialog>
  );
};
