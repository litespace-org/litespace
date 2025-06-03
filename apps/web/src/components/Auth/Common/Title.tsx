import HorizontalLogo from "@/components/Common/HorizontalLogo";
import { IUser } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { Typography } from "@litespace/ui/Typography";
import { useMemo } from "react";

type Role = IUser.Role.Student | IUser.Role.Tutor;

const Title: React.FC<{ type: "login" | "register"; role?: Role }> = ({
  type,
  role,
}) => {
  const intl = useFormatMessage();

  const description: LocalId = useMemo(() => {
    if (type === "login") return "login.welcome";
    if (role === IUser.Role.Student) return "register.welcome.student";
    return "register.welcome.tutor";
  }, [role, type]);

  return (
    <div className="flex flex-col gap-4 items-center text-center justify-center">
      <HorizontalLogo />
      <Typography tag="h2" className="text-natural-700 text-body">
        {intl(description)}
      </Typography>
    </div>
  );
};

export default Title;
