import { asFullAssetUrl } from "@litespace/luna";
import { Button, ButtonType, messages } from "@litespace/luna";
import { ICall, IUser } from "@litespace/types";
import React from "react";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";

const PendingInterview: React.FC<{
  interviewer: IUser.Self;
  call: ICall.Self;
}> = ({ interviewer, call }) => {
  const intl = useIntl();
  return (
    <div>
      <div className="flex flex-row bg-surface-100 w-fit rounded-3xl overflow-hidden border border-border-strong hover:border-border-stronger shadow-2xl">
        <div className="flex flex-col w-[300px]">
          <div className="overflow-hidden">
            {interviewer.image && (
              <img
                className="w-full h-full"
                src={asFullAssetUrl(interviewer.image)}
                alt={interviewer.name || "Interviewer"}
              />
            )}
          </div>
        </div>
        <div className="max-w-[400px] border-r border-r-muted pr-5 pl-4 my-6">
          <p className="text-lg text-foreground-light">
            {intl.formatMessage(
              {
                id: messages[
                  "page.tutor.onboarding.steps.first.booked.interview.description"
                ],
              },
              {
                interviewer: <strong> {interviewer.name} </strong>,
                day: <strong>{dayjs(call.start).format("dddd")}</strong>,
                date: (
                  <strong>{dayjs(call.start).format("DD MMMM, YYYY")}</strong>
                ),
                start: <strong>{dayjs(call.start).format("hh:mm a")}</strong>,
                end: (
                  <strong>
                    {dayjs(call.start)
                      .add(call.duration, "minutes")
                      .format("hh:mm a")}
                  </strong>
                ),
              }
            )}
          </p>

          <p className="mt-6 text-lg text-foreground-light">
            {intl.formatMessage({
              id: messages[
                "page.tutor.onboarding.steps.first.booked.interview.note.1"
              ],
            })}
          </p>

          <p className="mt-6 text-lg text-foreground-light">
            {intl.formatMessage({
              id: messages[
                "page.tutor.onboarding.steps.first.booked.interview.note.2"
              ],
            })}
          </p>

          <div className="flex flex-row gap-4 mt-6">
            <Link
              className="block w-1/2"
              to={Route.Call.replace(":id", call.id.toString())}
            >
              <Button type={ButtonType.Primary}>
                {intl.formatMessage({ id: messages["global.labels.go"] })}
              </Button>
            </Link>
            <span className="block w-1/2">
              <Button type={ButtonType.Error}>
                {intl.formatMessage({ id: messages["global.labels.cancel"] })}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingInterview;
