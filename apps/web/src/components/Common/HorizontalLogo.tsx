import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const HorizontalLogo: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex items-center gap-4">
      <Typography tag="h1" className="text-brand-500 text-h4 font-bold">
        {intl("labels.litespace")}
      </Typography>
      <Logo className="h-12 w-12" />
    </div>
  );
};

export default HorizontalLogo;
