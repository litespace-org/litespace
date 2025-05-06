import ErrorElement from "@/components/Common/Error";
import Detail from "@/components/Common/Detail";
import DateField from "@/components/Common/DateField";
import BinaryField from "@/components/Common/BinaryField";
import GenderField from "@/components/Common/GenderField";
import UserPopover from "@/components/Common/UserPopover";
import cn from "classnames";
import React, { useState } from "react";
import { Duration } from "@litespace/utils/duration";
import { formatMinutes, formatNumber } from "@litespace/ui/utils";
import { Loading } from "@litespace/ui/Loading";
import { ITutor, IUser, Void } from "@litespace/types";
import { PersonIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { rolesMap } from "@/components/utils/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

const Content: React.FC<{
  user?: IUser.Self;
  tutor?: ITutor.Self;
  tutorStats?: ITutor.FindTutorStatsApiResponse | null;
  loading?: boolean;
  error: Error | null;
  refetch: Void;
}> = ({ user, tutor, tutorStats, loading, error, refetch }) => {
  const intl = useFormatMessage();
  // TODO: use a hook to get the online status form the server cache
  const [onlineStatus] = useState(false);

  if (loading) return <Loading />;
  if (error)
    return (
      <ErrorElement
        title={intl("error.unexpected")}
        refetch={refetch}
        error={error}
      />
    );
  if (!user) return;

  return (
    <div className="p-4 mx-auto mt-6 border border-border-strong rounded-md shadow-ls-x-small w-full">
      <div className="flex gap-2 ">
        <div className="relative">
          {user.image ? (
            <div className="overflow-hidden border-2 border-white rounded-full">
              <img src={user.image} className="rounded-full w-14 h-14" />
            </div>
          ) : (
            <PersonIcon className="w-14 h-14" />
          )}

          <div
            className={cn(
              "absolute left-0 bottom-0 w-4 h-4 rounded-full ring ring-dash-sidebar",
              onlineStatus ? "bg-green-400" : "bg-gray-600"
            )}
          />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-2xl">
            <p>{user.name || "-"}</p>
            {user.verifiedEmail ? (
              <CheckCircledIcon className="w-6 h-6 text-green-400" />
            ) : null}
          </h2>
          <p className="text-lg text-foreground-light">
            {intl(rolesMap[user.role])}
          </p>
        </div>
      </div>
      <div className="grid gap-6 mt-4 sm:grid-cols-2 xl:grid-cols-3">
        <Detail label={intl("global.labels.id")}>{user.id}</Detail>
        <Detail label={intl("dashboard.user.name")}>{user.name}</Detail>
        <Detail label={intl("dashboard.user.email")}>{user.email}</Detail>
        {tutor ? (
          <Detail label={intl("dashboard.tutor.bio")}>{tutor.bio}</Detail>
        ) : null}

        <Detail label={intl("dashboard.user.birthYear")}>
          {user.birthYear}
        </Detail>

        {tutor ? (
          <Detail label={intl("dashboard.tutor.about")}>{tutor.about}</Detail>
        ) : null}

        {tutor ? (
          <Detail label={intl("dashboard.tutor.video")}>{tutor.video}</Detail>
        ) : null}

        <Detail label={intl("dashboard.user.hasPassword")}>
          <BinaryField yes={user.password} />
        </Detail>

        <Detail label={intl("dashboard.user.creditScore")}>
          {formatNumber(user.creditScore)}
        </Detail>

        <Detail label={intl("dashboard.user.gender")}>
          <GenderField gender={user.gender} />
        </Detail>

        {tutor ? (
          <Detail label={intl("dashboard.tutor.activated")}>
            <BinaryField yes={tutor.activated} />
          </Detail>
        ) : null}

        {tutor ? (
          <Detail label={intl("dashboard.tutor.activatedBy")}>
            {tutor.activated ? <UserPopover id={tutor.id} /> : "-"}
          </Detail>
        ) : null}

        {tutor ? (
          <Detail label={intl("dashboard.tutor.notice")}>
            {tutor.notice ? formatMinutes(tutor.notice) : "-"}
          </Detail>
        ) : null}

        <Detail label={intl("global.created-at")}>
          <DateField date={user.createdAt} />
        </Detail>

        {tutorStats ? (
          <>
            <Detail label={intl("stats.tutor.lesson.count")}>
              {formatNumber(tutorStats.lessonCount)}
            </Detail>
            <Detail label={intl("stats.tutor.student.count")}>
              {formatNumber(tutorStats.studentCount)}
            </Detail>
            <Detail label={intl("stats.tutor.teaching.hours")}>
              {Duration.from(tutorStats.totalMinutes.toString()).format("ar")}
            </Detail>
          </>
        ) : null}

        <Detail label={intl("global.updated-at")}>
          <DateField date={user.updatedAt} />

          {tutor ? (
            <React.Fragment>
              <br />
              <DateField date={tutor.updatedAt} />
            </React.Fragment>
          ) : null}
        </Detail>
      </div>
    </div>
  );
};

export default Content;
