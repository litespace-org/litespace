import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Dialog } from "@litespace/luna/Dialog";
import { Field, Label } from "@litespace/luna/Form";
import { Select } from "@litespace/luna/Select";
import { toaster } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Schedule, splitRuleEvent } from "@litespace/sol/rule";
import { ILesson, IRule } from "@litespace/types";
import { entries, flattenDeep, groupBy } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import { useCreateLesson } from "@litespace/headless/lessons";

const BookLesson: React.FC<{
  open: boolean;
  close: () => void;
  tutorId: number;
  name: string;
  rules: IRule.RuleEvent[];
  notice: number;
}> = ({ open, close, tutorId, name, rules, notice }) => {
  const intl = useFormatMessage();
  const [duration, setDuration] = useState<ILesson.Duration>(
    ILesson.Duration.Long
  );
  const [selectedEvent, setSelectedEvent] = useState<IRule.RuleEvent | null>(
    null
  );

  const events = useMemo(() => {
    const events = Schedule.order(
      flattenDeep(rules.map((rule) => splitRuleEvent(rule, duration))).filter(
        (event) => dayjs(event.start).isAfter(dayjs().add(notice, "minutes"))
      ),
      "asc"
    );

    const map = groupBy(events, (event) =>
      dayjs(event.start).format("YYYY-MM-DD")
    );

    return entries(map);
  }, [duration, notice, rules]);

  const onClose = useCallback(() => {
    setSelectedEvent(null);
    close();
  }, [close]);

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl("page.tutors.book.lesson.success", { tutor: name }),
    });

    onClose();
  }, [intl, name, onClose]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl("page.tutors.book.lesson.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl]
  );

  const mutation = useCreateLesson({
    selectedEvent,
    tutorId,
    duration,
    onSuccess,
    onError,
  });

  const options = useMemo(() => {
    return [
      {
        label: intl("global.lesson.duration.15"),
        value: 15,
      },
      {
        label: intl("global.lesson.duration.30"),
        value: 30,
      },
    ];
  }, [intl]);

  return (
    <Dialog
      title={intl("page.tutors.book.lesson.dialog.title", { name })}
      open={open}
      close={onClose}
      className="w-full md:w-3/4 max-w-[40rem]"
    >
      <Field
        label={
          <Label>
            {intl("page.tutors.book.lesson.dialog.lesson.duration")}
          </Label>
        }
        field={
          <Select value={duration} options={options} onChange={setDuration} />
        }
      />

      <ul className="h-[500px] overflow-y-auto scrollbar-thin flex flex-col gap-3 pb-4 pl-1.5 mt-4 ">
        {events.map(([date, list]) => (
          <li key={date} className="text-foreground">
            <h3 className="mb-3 text-base font-semibold">
              {dayjs(date).format("dddd, DD MMMM")}
            </h3>
            <ul className="grid grid-cols-12 gap-4">
              {list.map((event) => (
                <li key={event.start} className="col-span-3">
                  <Button
                    onClick={() => setSelectedEvent(event)}
                    disabled={mutation.isPending}
                    type={
                      selectedEvent?.start === event.start
                        ? ButtonType.Primary
                        : ButtonType.Secondary
                    }
                    className="w-full"
                  >
                    {dayjs(event.start).format("h:mm a")}
                  </Button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Button
        disabled={!selectedEvent || mutation.isPending}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
        className="mt-4"
        size={ButtonSize.Small}
      >
        {intl("global.labels.confirm")}
      </Button>
    </Dialog>
  );
};

export default BookLesson;
