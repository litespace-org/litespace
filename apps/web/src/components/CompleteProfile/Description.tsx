import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const Description: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center text-center">
      <Typography tag="h1" className="text-natural-950 font-bold text-body ">
        {intl("complete-profile.title")}
      </Typography>
      <Typography tag="p" className="text-natural-700 text-body">
        {intl("complete-profile.description")}
      </Typography>
    </div>
  );
};

export default Description;
