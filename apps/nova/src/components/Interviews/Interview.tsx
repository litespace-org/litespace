import { Button, ButtonSize } from "@litespace/luna/Button";
import { MenuAction, ActionsMenu } from "@litespace/luna/ActionsMenu";
import { Card } from "@litespace/luna/Card";
import * as Interviews from "@litespace/luna/Interviews";
import { messages } from "@litespace/luna/locales";
import { IInterview } from "@litespace/types";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import React, { useCallback, useMemo, useState } from "react";
import { MessageCircle } from "react-feather";
import dayjs from "@/lib/dayjs";
import { useIntl } from "react-intl";
import Update from "@/components/Interviews/Update";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import { useRender } from "@/hooks/render";
import cn from "classnames";

const Interview: React.FC<{
  interview: IInterview.Self;
  // tutor: ICall.PopuldatedMember;
  onUpdate: () => void;
}> = ({ interview, onUpdate }) => {
  const intl = useIntl();
  const watch = useRender();
  const [status, setStatus] = useState<IInterview.Status | null>(null);
  const upcoming = useMemo(() => {
    const now = dayjs();
    const start = dayjs(interview.start);
    return now.isBefore(start);
  }, [interview.start]);

  const started = useMemo(() => {
    const start = dayjs(interview.start);
    // todo: 30-minute constant should be moved to `sol`
    const end = start.add(30, "minutes");
    const now = dayjs();
    return now.isBetween(start, end, "minutes", "[]");
  }, [interview.start]);

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

  const { sm } = useMediaQueries();

  return (
    <Card className="w-full lg:w-2/3">
      <div className="flex flex-row justify-between gap-2">
        <div className="w-full">
          <Interviews.List>
            <Interviews.User name={"Tutor Name"} />
            <Interviews.Date start={interview.start} />
            <Interviews.Time start={interview.start} />
          </Interviews.List>

          <Interviews.Feedback
            feedback={interview.feedback.interviewer}
            tutor={false}
          />

          <Interviews.Feedback
            feedback={interview.feedback.interviewee}
            tutor={true}
          />
        </div>

        <div>
          <ActionsMenu actions={actions} />
        </div>
      </div>

      <div className="flex flex-row gap-2 mt-4">
        {upcoming ? (
          <Link to={Route.Call.replace(":id", interview.ids.call.toString())}>
            <Button size={sm ? ButtonSize.Small : ButtonSize.Tiny}>
              {!started
                ? intl.formatMessage(
                    { id: messages["page.interviews.join.future"] },
                    { duration: dayjs(interview.start).fromNow(true) }
                  )
                : intl.formatMessage(
                    { id: messages["page.interviews.join.past"] },
                    { duration: dayjs(interview.start).fromNow(true) }
                  )}
            </Button>
          </Link>
        ) : null}

        <Button
          className={cn({
            "!w-[26px]": !sm,
          })}
          size={sm ? ButtonSize.Small : ButtonSize.Tiny}
          disabled
        >
          <MessageCircle className="w-[20px] h-[20px] md:w-auto md:h-auto" />
        </Button>
      </div>

      {status ? (
        <Update
          open
          close={reset}
          status={status}
          tutor={"tutor name"}
          interview={interview.ids.self}
          onUpdate={onUpdate}
        />
      ) : null}
    </Card>
  );
};

export default Interview;
