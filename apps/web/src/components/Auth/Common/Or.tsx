import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const Or: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex gap-2 items-center mt-4 mb-6">
      <div className="w-full h-[.5px] bg-natural-400" />
      <Typography tag="span" className="text-body text-natural-400">
        {intl("labels.or")}
      </Typography>
      <div className="w-full h-[.5px] bg-natural-400" />
    </div>
  );
};

export default Or;
