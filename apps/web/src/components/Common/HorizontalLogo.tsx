import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const HorizontalLogo: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex items-center gap-2">
      <Typography tag="h1" className="text-brand-500 text-subtitle-1 font-bold">
        {intl("labels.litespace")}
      </Typography>
      <Logo className="h-9 w-9" />
    </div>
  );
};

export default HorizontalLogo;
