import {
  Button,
  ButtonType,
  ButtonSize,
} from "@litespace/luna/Button";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { IInterview, IRoom } from "@litespace/types";
import React from "react";

const PendingInterview: React.FC<{
  interviewer: IRoom.PopulatedMember;
  interview: IInterview.Self;
}> = ({ interviewer }) => {
  const intl = useFormatMessage();
  return (
    <div>
      <div className="flex flex-row overflow-hidden border shadow-2xl bg-surface-100 w-fit rounded-3xl border-border-strong hover:border-border-stronger">
        <div className="flex flex-col w-[300px]">
          <div className="overflow-hidden">
            <img
              className="w-full h-full"
              src={
                interviewer.image
                  ? asFullAssetUrl(interviewer.image)
                  : "/avatar-1.png"
              }
              alt={interviewer.name || "Interviewer"}
            />
          </div>
        </div>
        <div className="max-w-[400px] border-r border-r-muted pr-5 pl-4 my-6">
          {/* <p className="text-lg text-foreground-light">
            {intl(
              "page.tutor.onboarding.steps.first.booked.interview.description",
              {
                interviewer: interviewer.name,
                day: dayjs(call.start).format("dddd"),
                date: dayjs(call.start).format("DD MMMM, YYYY"),
                start: dayjs(call.start).format("hh:mm a"),
                end: dayjs(call.start)
                  .add(call.duration, "minutes")
                  .format("hh:mm a"),
              }
            )}
          </p> */}

          <p className="mt-6 text-lg text-foreground-light">
            {intl("page.tutor.onboarding.steps.first.booked.interview.note.1")}
          </p>

          <p className="mt-6 text-lg text-foreground-light">
            {intl("page.tutor.onboarding.steps.first.booked.interview.note.2")}
          </p>

          <div className="flex flex-row gap-4 mt-6">
            {/*
            <Link to={Route.Call.replace(":id", session.sessionId)}>
              <Button
                size={ButtonSize.Small}
                type={ButtonType.Main}
                variant={ButtonVariant.Primary}
              >
                {intl("global.labels.go")}
              </Button>
            </Link>
            */}
            <Button size={ButtonSize.Small} type={ButtonType.Error}>
              {intl("global.labels.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingInterview;
