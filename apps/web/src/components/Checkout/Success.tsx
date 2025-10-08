import CheckCircleV2 from "@litespace/assets/CheckCircleV2";
import { ITransaction } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

const Success: React.FC<{ type: ITransaction.Type }> = ({ type }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-6 md:gap-4 items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <CheckCircleV2 className="w-6 h-6 [&>*]:stroke-brand-500" />
        <Typography tag="h1" className="text-subtitle-1 font-bold">
          {intl("checkout.payment.done")}
        </Typography>
      </div>

      <div className="flex gap-4">
        {type === ITransaction.Type.PaidPlan ? (
          <Link to={Web.Tutors} tabIndex={-1}>
            <Button type="main" variant="primary" size="large">
              <Typography tag="span" className="text text-body font-medium">
                {intl("checkout.payment.done.book-lesson-now")}
              </Typography>
            </Button>
          </Link>
        ) : null}

        <Link to={Web.StudentDashboard} tabIndex={-1}>
          <Button type="main" variant="secondary" size="large">
            <Typography tag="span" className="text text-body font-medium">
              {intl("checkout.payment.done.main-page")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
