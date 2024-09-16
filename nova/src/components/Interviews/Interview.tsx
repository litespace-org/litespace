import {
  ActionsMenu,
  Button,
  ButtonSize,
  Card,
  MenuAction,
  messages,
} from "@litespace/luna";
import { ICall, IInterview } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import { Calendar, Clock, MessageCircle, User } from "react-feather";
import dayjs from "@/lib/dayjs";
import { useIntl } from "react-intl";
import { useRender } from "@/hooks/render";
import Update, { Status } from "@/components/Interviews/Update";

const Interview: React.FC<{
  interview: IInterview.Self;
  call: ICall.Self;
  tutor: ICall.PopuldatedMember;
}> = ({ call, interview, tutor }) => {
  const intl = useIntl();
  const [status, setStatus] = useState<Status | null>(null);
  const update = useRender();
  const upcoming = useMemo(() => {
    const now = dayjs();
    const start = dayjs(call.start);
    return now.isBefore(start);
  }, [call.start]);

  const started = useMemo(() => {
    const start = dayjs(call.start);
    const end = start.add(call.duration, "minutes");
    const now = dayjs();
    return now.isBetween(start, end, "minutes", "[]");
  }, [call.duration, call.start]);

  const reset = useCallback(() => {
    setStatus(null);
  }, []);

  const actions = useMemo((): MenuAction[] => {
    return [
      {
        id: 1,
        label: intl.formatMessage({
          id: messages["page.interviews.actions.pass"],
        }),
        onClick: () => setStatus(IInterview.Status.Passed),
        disabled: interview.status === IInterview.Status.Passed,
      },
      {
        id: 2,
        label: intl.formatMessage({
          id: messages["global.labels.watch.lesson"],
        }),
      },
      {
        id: 3,
        label: intl.formatMessage({
          id: messages["global.labels.download.lesson"],
        }),
      },
      {
        id: 4,
        label: intl.formatMessage({
          id: messages["page.interviews.actions.reject"],
        }),
        onClick: () => setStatus(IInterview.Status.Rejected),
        disabled: interview.status === IInterview.Status.Rejected,
        danger: true,
      },
      {
        id: 5,
        label: intl.formatMessage({
          id: messages["page.interviews.actions.cancel"],
        }),
        onClick: () => setStatus(IInterview.Status.Canceled),
        disabled: interview.status === IInterview.Status.Canceled,
        danger: true,
      },
    ];
  }, [interview.status, intl]);

  return (
    <Card>
      <div className="flex flex-row justify-between gap-2">
        <ul className="flex flex-col gap-3">
          <li className="flex flex-row gap-2">
            <User />
            <p>{tutor.name.ar}</p>
          </li>
          <li className="flex flex-row gap-2">
            <Calendar />
            <p>
              {dayjs(call.start).format("dddd، DD MMMM، YYYY")} (
              {dayjs(call.start).fromNow()})
            </p>
          </li>
          <li className="flex flex-row gap-2">
            <Clock />
            <p>{dayjs(call.start).format("h:mm a")}</p>
          </li>
        </ul>

        <div>
          <ActionsMenu actions={actions} />
        </div>
      </div>

      <div className="mt-4 flex flex-row gap-2">
        {upcoming ? (
          <Button size={ButtonSize.Small}>
            {!started
              ? intl.formatMessage(
                  { id: messages["page.interviews.join.future"] },
                  { duration: dayjs(call.start).fromNow(true) }
                )
              : intl.formatMessage(
                  { id: messages["page.interviews.join.past"] },
                  { duration: dayjs(call.start).fromNow(true) }
                )}
          </Button>
        ) : null}

        <Button size={ButtonSize.Small} disabled>
          <MessageCircle />
        </Button>
      </div>

      {status ? (
        <Update
          open
          close={reset}
          status={status}
          tutor={tutor.name.ar || ""}
          interview={interview.ids.self}
        />
      ) : null}
    </Card>
  );
};

export default Interview;
