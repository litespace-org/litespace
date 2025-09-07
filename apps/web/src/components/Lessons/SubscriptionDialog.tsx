import { router } from "@/lib/routes";
import Timer2 from "@litespace/assets/Timer2";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

export const SubscriptionDialog: React.FC<{
  open: boolean;
  close: Void;
}> = ({ open, close }) => {
  const { md } = useMediaQuery();
  const intl = useFormatMessage();

  return (
    <Dialog
      className="max-w-[400px]"
      position={md ? "center" : "bottom"}
      open={open}
      close={close}
      title={
        <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
          <div className="bg-brand-100 rounded-full flex items-center justify-center p-1">
            <Timer2 className="[&>*]:stroke-brand-500 w-6 h-6" />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-1 mt-4 mb-6">
        <Typography
          tag="p"
          className="text-body font-semibold text-natural-950"
        >
          {intl("book-lesson.subscription-dialog.title")}
        </Typography>

        <Typography
          tag="p"
          className="text-caption font-regular text-natural-700"
        >
          {intl("book-lesson.subscription-dialog.body")}
        </Typography>
      </div>
      <Link to={router.web({ route: Web.Plans, full: true })}>
        <Button size="large" className="text w-full">
          {intl("book-lesson.subscription-dialog.btn")}
        </Button>
      </Link>
    </Dialog>
  );
};

export default SubscriptionDialog;
