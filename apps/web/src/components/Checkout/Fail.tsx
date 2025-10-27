import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { ITransaction } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

const Fail: React.FC<{ type: ITransaction.Type }> = ({ type }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-6 md:gap-4 items-center justify-center">
      <div className="flex flex-row items-center gap-2">
        <ExclaimationMarkCircle className="w-6 h-6 [&>*]:stroke-destruction-500" />
        <Typography tag="h1" className="text-subtitle-1 font-bold">
          {intl("checkout.payment.failed.title")}
        </Typography>
      </div>

      <div className="flex gap-4">
        {type === ITransaction.Type.PaidLesson ? (
          <Link to={Web.Tutors} tabIndex={-1}>
            <Button
              type="main"
              variant="primary"
              size="large"
              className="text text-body font-medium"
            >
              {intl("labels.try-again")}
            </Button>
          </Link>
        ) : null}

        {type === ITransaction.Type.PaidPlan ? (
          <Link to={Web.Plans} tabIndex={-1}>
            <Button
              type="main"
              variant="primary"
              size="large"
              className="text text-body font-medium"
            >
              {intl("labels.try-again")}
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default Fail;
