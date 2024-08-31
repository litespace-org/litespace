import {
  Button,
  ButtonType,
  Dialog,
  Field,
  Label,
  messages,
  Select,
} from "@litespace/luna";
import { Schedule, splitRuleEvent } from "@litespace/sol";
import { IRule } from "@litespace/types";
import { entries, flattenDeep, groupBy } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import { useIntl } from "react-intl";

const BookLesson: React.FC<{
  open: boolean;
  close: () => void;
  name: string;
  rules: IRule.RuleEvent[];
}> = ({ open, close, name, rules }) => {
  const intl = useIntl();
  const [duration, setDuration] = useState<number>(30);
  const [selectedEvent, setSelectedEvent] = useState<IRule.RuleEvent | null>(
    null
  );

  const events = useMemo(() => {
    const events = Schedule.order(
      flattenDeep(rules.map((rule) => splitRuleEvent(rule, duration))),
      "asc"
    );

    const map = groupBy(events, (event) =>
      dayjs(event.start).format("YYYY-MM-DD")
    );

    return entries(map);
  }, [duration, rules]);

  const onClose = useCallback(() => {
    setSelectedEvent(null);
    close();
  }, [close]);

  const options = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: messages["global.lesson.duration.15"],
        }),
        value: 15,
      },
      {
        label: intl.formatMessage({
          id: messages["global.lesson.duration.30"],
        }),
        value: 30,
      },
    ];
  }, [intl]);

  return (
    <Dialog
      title={intl.formatMessage(
        { id: messages["page.tutors.book.lesson.dialog.title"] },
        { name }
      )}
      open={open}
      close={onClose}
    >
      <Field
        label={
          <Label>
            {intl.formatMessage({
              id: messages["page.tutors.book.lesson.dialog.lesson.duration"],
            })}
          </Label>
        }
        field={
          <Select value={duration} options={options} onChange={setDuration} />
        }
      />

      <ul className="h-[500px] overflow-y-auto main-scrollbar flex flex-col gap-3 pb-4 mt-4">
        {events.map(([date, list]) => (
          <li key={date} className="text-foreground">
            <h3 className="text-base font-semibold mb-3">
              {dayjs(date).format("dddd, DD MMMM")}
            </h3>
            <ul className="flex flex-col gap-3">
              {list.map((event) => (
                <li key={event.start} className="px-6">
                  <Button
                    onClick={() => setSelectedEvent(event)}
                    type={
                      selectedEvent?.start === event.start
                        ? ButtonType.Primary
                        : ButtonType.Secondary
                    }
                  >
                    {dayjs(event.start).format("h:mm a")}
                  </Button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Button disabled={!selectedEvent} className="mt-4">
        {intl.formatMessage({
          id: messages["global.labels.confirm"],
        })}
      </Button>
    </Dialog>
  );
};

export default BookLesson;
