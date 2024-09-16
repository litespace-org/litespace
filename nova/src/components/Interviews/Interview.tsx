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
import Update from "@/components/Interviews/Update";
import Feedback from "@/components/Interviews/Feedback";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import WatchCall from "../Call/WatchCall";
import { useRender } from "@/hooks/render";
import Status from "@/components/Call/Status";

const Interview: React.FC<{
  interview: IInterview.Self;
  call: ICall.Self;
  tutor: ICall.PopuldatedMember;
  onUpdate: () => void;
}> = ({ call, interview, tutor, onUpdate }) => {
  const intl = useIntl();
  const watch = useRender();
  const [status, setStatus] = useState<IInterview.Status | null>(null);
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
          id: messages["page.interviews.actions.edit"],
        }),
        onClick: () => setStatus(IInterview.Status.Passed),
        disabled: interview.status === IInterview.Status.Passed,
      },
      {
        id: 2,
        label: intl.formatMessage({
          id: messages["page.interviews.actions.watch"],
        }),
        onClick: watch.show,
      },
      {
        id: 3,
        label: intl.formatMessage({
          id: messages["page.interviews.actions.download"],
        }),
      },
    ];
  }, [interview.status, intl, watch.show]);

  console.log(call.recordingStatus);

  return (
    <Card>
      <div className="flex flex-row justify-between gap-2">
        <div className="w-full">
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

            <Status status={call.recordingStatus} interview />
          </ul>

          {interview.feedback.interviewer ? (
            <div className="mt-3">
              <Feedback
                title={intl.formatMessage({
                  id: messages["page.interviews.interviewer.feedback"],
                })}
                feedback={interview.feedback.interviewer}
              />
            </div>
          ) : null}

          {interview.feedback.interviewee ? (
            <div className="mt-3">
              <Feedback
                title={intl.formatMessage({
                  id: messages["page.interviews.tutor.feedback"],
                })}
                feedback={interview.feedback.interviewee}
              />
            </div>
          ) : null}
        </div>

        <div>
          <ActionsMenu actions={actions} />
        </div>
      </div>

      <div className="mt-4 flex flex-row gap-2">
        {upcoming ? (
          <Link to={Route.Call.replace(":id", call.id.toString())}>
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
          </Link>
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
          onUpdate={onUpdate}
        />
      ) : null}

      <WatchCall
        callId={call.id}
        close={watch.hide}
        open={watch.open}
        title={intl.formatMessage(
          { id: messages["page.interviews.watch.interview"] },
          { name: tutor.name.ar }
        )}
      />
    </Card>
  );
};

export default Interview;
