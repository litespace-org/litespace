import { useFindUserById } from "@litespace/headless/users";
import { HoverCard } from "@litespace/ui/HoverCard";
import { Loading } from "@litespace/ui/Loading";
import React from "react";
import { AlertCircle, User } from "react-feather";
import { rolesMap } from "@/components/utils/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Link } from "react-router-dom";
import { router } from "@/lib/route";
import { Dashboard } from "@litespace/utils/routes";

const UserPopover: React.FC<{ id: number }> = ({ id }) => {
  const intl = useFormatMessage();
  const { query: user } = useFindUserById(id);

  return (
    <HoverCard
      content={
        <div className="flex w-72 min-h-16">
          {user.isLoading ? <Loading /> : null}

          {user.error ? (
            <div className="flex items-center justify-center w-full">
              <AlertCircle className="text-destructive-600" />
            </div>
          ) : null}

          {user.data ? (
            <div>
              <div className="flex flex-row items-center gap-4">
                <div>
                  {user.data.image ? (
                    <img
                      src={user.data.image}
                      className="w-16 h-16 rounded-full shadow-2xl"
                    />
                  ) : (
                    <User />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p>
                    {user.data.name || "-"}
                    &nbsp; &bull; &nbsp;
                    <span>{intl(rolesMap[user.data.role])}</span>
                  </p>
                  <p className="text-foreground-light text-sm">
                    {user.data.email}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      }
    >
      {user.data ? (
        <Link
          to={router.dashboard({ route: Dashboard.User, id: user.data.id })}
          className="hover:bg-background-selection px-2 py-0.5 rounded-md inline-block truncate"
        >
          <div className="flex flex-col gap-1">
            <p>
              {user.data.name || "-"}
              &nbsp; &bull; &nbsp;
              <span>{intl(rolesMap[user.data.role])}</span>
            </p>
          </div>
        </Link>
      ) : (
        "-"
      )}
    </HoverCard>
  );
};

export default UserPopover;
