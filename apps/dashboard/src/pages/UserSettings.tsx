import { Route } from "@/lib/route";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useNavigate } from "react-router-dom";
import VerificationDetails from "./UserSettings/Verification";

const UserSettings = () => {
  const intl = useFormatMessage();
  const user = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();
  if (!user) {
    navigate(Route.Login);
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl">
        {intl("dashboard.user-settings.welcome", {
          name: user.name || user.email,
        })}
      </h1>
      <VerificationDetails />
    </div>
  );
};

export default UserSettings;
