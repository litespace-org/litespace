import { asFullAssetUrl } from "@litespace/luna/backend";
import { IUser, Void } from "@litespace/types";
import { PersonIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { rolesMap } from "@/components/utils/user";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import cn from "classnames";
import React from "react";
import { Loading } from "@litespace/luna/Loading";
import ErrorElement from "@/components/common/Error";
import Detail from "@/components/common/Detail";
import { formatNumber } from "@litespace/luna/utils";
import DateField from "@/components/common/DateField";

const Content: React.FC<{
  user?: IUser.Self;
  loading?: boolean;
  error: Error | null;
  refetch: Void;
}> = ({ user, loading, error, refetch }) => {
  const intl = useFormatMessage();

  if (loading) return <Loading className="h-[40vh]" />;
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
    <div className="p-4 mx-auto mt-6 border border-border-strong rounded-md drop-shadow-xl">
      <div className="flex gap-2 ">
        <div className="relative">
          {user.image ? (
            <div className="overflow-hidden border-2 border-white rounded-full">
              <img
                src={asFullAssetUrl(user.image)}
                className="rounded-full w-14 h-14"
              />
            </div>
          ) : (
            <PersonIcon className="w-14 h-14" />
          )}

          <div
            className={cn(
              "absolute left-0 bottom-0 w-4 h-4 rounded-full ring ring-dash-sidebar",
              user.online ? "bg-green-400" : "bg-gray-600"
            )}
          />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-2xl">
            <p>{user.name || "-"}</p>
            {user.verified ? (
              <CheckCircledIcon className="w-6 h-6 text-green-400" />
            ) : null}
          </h2>
          <p className="text-lg text-foreground-light">
            {intl(rolesMap[user.role])}
          </p>
        </div>
      </div>
      <div className="grid gap-6 mt-4 sm:grid-cols-2">
        <Detail label={intl("dashboard.user.email")}>{user.email}</Detail>
        <Detail label={intl("global.labels.id")}>{user.id}</Detail>
        <Detail label={intl("dashboard.user.birthYear")}>{user.id}</Detail>
        <Detail label={intl("dashboard.user.hasPassword")}>
          {intl(user.password ? "global.labels.yes" : "global.labels.no")}
        </Detail>
        <Detail label={intl("dashboard.user.creditScore")}>
          {formatNumber(user.creditScore)}
        </Detail>
        <Detail label={intl("dashboard.user.gender")}>
          {user.gender === IUser.Gender.Male
            ? intl("global.gender.male")
            : user.gender === IUser.Gender.Female
            ? intl("global.gender.female")
            : "-"}
        </Detail>
        <Detail label={intl("global.created-at")}>
          <DateField date={user.createdAt} />
        </Detail>
        <Detail label={intl("global.updated-at")}>
          <DateField date={user.updatedAt} />
        </Detail>
      </div>
    </div>
  );
};

export default Content;