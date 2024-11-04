import { useFindUserById } from "@litespace/headless/users";
import { useParams, Link } from "react-router-dom";
import { User, CheckCircle, Check, X, ArrowRight } from "react-feather";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import Error from "@/components/common/Error";
import { Loading } from "@litespace/luna/Loading";
import { IUser } from "@litespace/types";
import { LocalId } from "@litespace/luna/locales";
import cn from "classnames";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { UseQueryResult } from "@tanstack/react-query";

type UserProfileParams = {
  id: string;
};

const UserRoles: Record<IUser.Role, LocalId> = {
  "super-admin": "global.role.super-admin",
  "media-provider": "global.role.media-provider",
  "reg-admin": "global.role.regular-admin",
  interviewer: "global.role.interviewer",
  student: "global.role.student",
  tutor: "global.role.tutor",
};

const UserProfile = () => {
  const params = useParams<UserProfileParams>();
  const intl = useFormatMessage();

  const query: UseQueryResult<IUser.Self> = useFindUserById(params.id!);
  if (query.error)
    return (
      <Error
        error={query.error}
        refetch={query.refetch}
        title={intl("page.user.error")}
      />
    );

  return (
    <div className="p-8">
      <Link
        to={"/users"}
        className="flex items-center gap-2 p-3 text-2xl duration-300 rounded-lg hover:bg-muted w-fit"
      >
        <ArrowRight className="w-6 h-6" />
        <span>
          {intl("global.goto")} {intl("dashboard.users.title")}
        </span>
      </Link>
      {!query.data || query.isLoading ? (
        <Loading />
      ) : (
        <div className="p-4 mx-auto mt-6 border rounded-md sm:w-2/3">
          <div className="flex gap-2 ">
            <div className="relative">
              {query.data.image ? (
                <div className="overflow-hidden border-2 border-white rounded-full">
                  <img
                    src={asFullAssetUrl(query.data.image)}
                    className="rounded-full w-14 h-14"
                  />
                </div>
              ) : (
                <User className="w-14 h-14" />
              )}
              <div
                className={cn(
                  "absolute bottom-0 w-4 h-4 rounded-full",
                  query.data.online ? "bg-green-400" : "bg-gray-600"
                )}
              />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-2xl">
                {query.data.name}
                {query.data.verified ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : null}
              </h2>
              <p className="text-lg text-foreground-light">
                {intl(UserRoles[query.data.role])}
              </p>
            </div>
          </div>
          <div className="grid gap-6 mt-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xl">{intl("dashboard.user.email")}</h3>
              <p className="text-lg text-foreground-lighter">
                {query.data.email}
              </p>
            </div>
            <div>
              <h3 className="text-xl">{intl("dashboard.invoices.userId")}</h3>
              <p className="text-lg text-foreground-lighter">{query.data.id}</p>
            </div>
            <div>
              <h3 className="text-xl">{intl("dashboard.user.birthYear")}</h3>
              <p className="text-lg text-foreground-lighter">
                {query.data.birthYear}
              </p>
            </div>
            <div>
              <h3 className="text-xl">{intl("dashboard.user.hasPassword")}</h3>
              <p className="text-lg text-foreground-lighter">
                {query.data.password ? <Check /> : <X />}
              </p>
            </div>
            <div>
              <h3 className="text-xl">{intl("dashboard.user.creditScore")}</h3>
              <p className="text-lg text-foreground-lighter">
                {query.data.creditScore}
              </p>
            </div>
            <div>
              <h3 className="text-xl">{intl("dashboard.user.gender")}</h3>
              <p className="text-lg text-foreground-lighter">
                {query.data.gender === IUser.Gender.Male ? (
                  <span>&#9794;</span>
                ) : (
                  <span>&#9792;</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
