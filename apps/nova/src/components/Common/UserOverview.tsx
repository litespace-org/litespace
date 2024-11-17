import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { Typography } from "@litespace/luna/Typography";
import { User } from "react-feather";

const UserOverview = () => {
  const user = useAppSelector(profileSelectors.user);
  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex items-center">
      <div>
        {user.image ? (
          <img
            className="rounded-full w-10 h-10"
            src={asFullAssetUrl(user?.image)}
          />
        ) : (
          <User className="w-10 h-10" />
        )}
      </div>
      <div>
        <Typography className="text-natural-950 font-cairo font-semibold text-sm">
          {user.name || "New User"}
        </Typography>
        <Typography className="text-natural-600 font-cairo text-xs">
          {user.email}
        </Typography>
      </div>
    </div>
  );
};

export default UserOverview;
