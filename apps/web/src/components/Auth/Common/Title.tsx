import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const Title: React.FC<{ type: "login" | "register" }> = ({ type }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
      <Logo className="h-[87px]" />
      <div className="flex flex-col gap-2 items-start justify-center">
        <Typography tag="h1" className="text-brand-500 text-h3 font-bold">
          {intl("labels.litespace")}
        </Typography>
        <Typography tag="span" className="text-natural-700 text-body">
          {intl(type === "login" ? "login.welcome" : "register.welcome")}
        </Typography>
      </div>
    </div>
  );
};

export default Title;
