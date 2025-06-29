import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

export const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-2 text-center">
      <Typography tag="h3" className="text-h3 font-bold text-natural-950">
        {intl("tutor-onboarding.step.interview.title")}
      </Typography>
      <Typography tag="p" className="text-tiny text-natural-700 max-w-[500px]">
        {intl("tutor-onboarding.step.interview.desc")}
      </Typography>
    </div>
  );
};

export default Header;
