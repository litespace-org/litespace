import { useFormatMessage } from "@litespace/ui/hooks/intl";
import VerificationDetails from "@/components/UserSettings/Verification";
import { Typography } from "@litespace/ui/Typography";

const UserSettings = () => {
  const intl = useFormatMessage();

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <Typography tag="h3" className="text-h3">
        {intl("dashboard.user-settings.title")}
      </Typography>

      <div className="mt-4">
        <VerificationDetails />
      </div>
    </div>
  );
};

export default UserSettings;
