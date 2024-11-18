import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import ProfileImage from "@/components/Common/ProfileImage";
import { Route } from "@/types/routes";
import { Link } from "react-router-dom";

const UserOverview = () => {
  const intl = useFormatMessage();
  const user = useAppSelector(profileSelectors.user);
  if (!user) return null;

  return (
    <Link to={Route.Settings} className="flex items-center gap-2">
      <div className="rounded-full overflow-hidden">
        <ProfileImage image={user?.image} />
      </div>
      <div>
        <Typography className="text-natural-950 font-cairo font-semibold text-sm">
          {user.name || intl("nova.user-overview.name.placeholder")}
        </Typography>
        <Typography className="text-natural-600 font-cairo text-xs mt-1">
          {user.email}
        </Typography>
      </div>
    </Link>
  );
};

export default UserOverview;
