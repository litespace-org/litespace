import { useFindUserById } from "@litespace/headless/users";
import { HoverCard } from "@litespace/ui/HoverCard";
import { Loading } from "@litespace/ui/Loading";
import React from "react";
import { rolesMap } from "@/components/utils/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Link } from "react-router-dom";
import { router } from "@/lib/route";
import { Dashboard } from "@litespace/utils/routes";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { IUser } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";

const UserPopover: React.FC<{ id: number }> = ({ id }) => {
  const intl = useFormatMessage();
  const user = useFindUserById(id);

  return (
    <HoverCard
      content={
        <Content
          user={user.data}
          loading={user.isLoading}
          error={user.isError}
        />
      }
    >
      {user.data ? (
        <Link
          to={router.dashboard({ route: Dashboard.User, id: user.data.id })}
          className="hover:bg-background-selection px-2 py-0.5 rounded-md inline-block truncate"
        >
          <div className="flex flex-col gap-1">
            <Typography tag="p">
              {user.data.name || "-"}
              &nbsp; &bull; &nbsp;
              <span>{intl(rolesMap[user.data.role])}</span>
            </Typography>
          </div>
        </Link>
      ) : (
        "-"
      )}
    </HoverCard>
  );
};

const Content: React.FC<{
  user?: IUser.Self | null;
  loading: boolean;
  error: boolean;
}> = ({ user, loading, error }) => {
  const intl = useFormatMessage();

  if (loading) return <Loading size="medium" />;
  if (error) return "Error loading user data.";
  if (!user) return "User not found";

  return (
    <div>
      <div className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <AvatarV2 id={user.id} src={user.image} alt={user.name} />
        </div>
        <div className="flex flex-col gap-1">
          <p>
            {user.name || "-"}
            &nbsp; &bull; &nbsp;
            <span>{intl(rolesMap[user.role])}</span>
          </p>
          <p className="text-foreground-light text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserPopover;
