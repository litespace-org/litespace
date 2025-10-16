import CheckCircle from "@litespace/assets/CheckCircle";
import EmptyStudentDashboard from "@litespace/assets/EmptyStudentDashboard";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

const LessonBookedDialog: React.FC<{ open: boolean }> = ({ open }) => {
  const intl = useFormatMessage();

  return (
    <Dialog open={open} className="xs:max-w-[350px]">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 mb-4 max-w-[198px] ">
          <EmptyStudentDashboard className="w-[156px] h-[122px]" />

          <div className="flex gap-2">
            <CheckCircle className="w-6 h-6 [&>*]:stroke-brand-500 [&>*]:stroke-[2px]" />
            <Typography tag="p" className="text-caption font-medium">
              {intl("checkout.payment.trial-session.done.title")}
            </Typography>
          </div>

          <Typography
            tag="p"
            className="text-caption text-natural-700 text-center"
          >
            {intl("checkout.payment.trial-session.done.describtion")}
          </Typography>
        </div>

        <Link to={Web.StudentDashboard} tabIndex={-1}>
          <Button size="large">
            <Typography tag="span" className="text text-body font-medium">
              {intl("checkout.payment.done.main-page")}
            </Typography>
          </Button>
        </Link>
      </div>
    </Dialog>
  );
};

export default LessonBookedDialog;
