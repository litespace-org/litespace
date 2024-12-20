import { useFormatMessage } from "@litespace/luna/hooks/intl";
import VerificationDetails from "@/components/UserSettings/Verification";
import { Typography } from "@litespace/luna/Typography";

const UserSettings = () => {
  const intl = useFormatMessage();

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <Typography element="h3">
        {intl("dashboard.user-settings.title")}
      </Typography>

      <div className="mt-4">
        <VerificationDetails />
      </div>
    </div>
  );
};

export default UserSettings;
