import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales/request";
import { Typography } from "@litespace/ui/Typography";

export const Highlight: React.FC<{ id: LocalId }> = ({ id }) => {
  const intl = useFormatMessage();

  return intl.rich(id, {
    highlight: (chunks) => (
      <Typography tag="span" className="text-brand-500">
        {chunks}
      </Typography>
    ),
  });
};
