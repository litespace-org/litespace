import { router } from "@/lib/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { ITutor, IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { isOnboard } from "@litespace/utils/tutor";
import { Link } from "react-router-dom";

function asFullTutor(
  user: IUser.Self | null,
  metaData: ITutor.Self | null
): ITutor.FullTutor | null {
  if (!user || !metaData) return null;
  return {
    ...user,
    ...metaData,
    metaUpdatedAt: "",
  };
}

const CompleteProfileBanner = () => {
  const intl = useFormatMessage();
  const { user, meta } = useUserContext();

  const isTutor =
    user && [IUser.Role.Tutor, IUser.Role.TutorManager].includes(user.role);

  const tutorDetails = useFindTutorInfo(isTutor ? user?.id : null);

  if (!tutorDetails || !isTutor) return null;

  const fullTutor = asFullTutor(user, meta);
  const isOnboarded = !!fullTutor && isOnboard(fullTutor);

  if (isOnboarded) return null;

  return (
    <div className="bg-brand-700 flex items-center justify-center gap-4 h-[72px] w-full">
      <Typography tag="p" className="text-tiny md:text-caption text-white">
        {intl("layout.banner.complete-profile")}
      </Typography>
      <Link
        to={router.web({
          route: Web.TutorSettings,
        })}
      >
        <Button size="large" variant="secondary">
          {intl("layout.banner.complete-profile.action")}
        </Button>
      </Link>
    </div>
  );
};

export default CompleteProfileBanner;
