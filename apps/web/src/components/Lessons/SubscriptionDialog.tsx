import { router } from "@/lib/routes";
import Timer2 from "@litespace/assets/Timer2";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { LITESPACE_SUPPORT_URL } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

export const SubscriptionDialog: React.FC<{
  tutorName: string;
  open: boolean;
  close: Void;
}> = ({ tutorName, open, close }) => {
  const intl = useFormatMessage();

  return (
    <Dialog
      className="max-w-[550px]"
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
          {intl("book-lesson.subscription-dialog.title", { name: tutorName })}
        </Typography>

        <Typography
          tag="p"
          className="text-caption font-regular text-natural-700"
        >
          {intl("book-lesson.subscription-dialog.body")}
        </Typography>

        <Typography
          tag="p"
          className="text-caption font-regular text-natural-700"
        >
          {intl("book-lesson.subscription-dialog.body-2")}
        </Typography>

        <ul>
          <Typography
            tag="li"
            className="list-[square] list-inside gap-2 mr-2 text-caption font-regular text-natural-700"
          >
            {intl("book-lesson.subscription-dialog.body-bullet-1")}
          </Typography>
          <Typography
            tag="li"
            className="list-[square] list-inside gap-2 mr-2 text-caption font-regular text-natural-700"
          >
            {intl("book-lesson.subscription-dialog.body-bullet-2")}
          </Typography>
          <Typography
            tag="li"
            className="list-[square] list-inside gap-2 mr-2 text-caption font-regular text-natural-700"
          >
            {intl("book-lesson.subscription-dialog.body-bullet-3")}
          </Typography>
        </ul>

        <Typography
          tag="p"
          className="text-caption font-regular text-natural-700"
        >
          {intl("book-lesson.subscription-dialog.body-3")}
        </Typography>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={router.web({ route: Web.Tutors, full: true })}
          className="w-full"
        >
          <Button
            size="large"
            className="text w-full px-0"
            onClick={close}
            variant="secondary"
          >
            {intl("book-lesson.subscription-dialog.btn-2")}
          </Button>
        </Link>

        <Link
          to={router.web({ route: Web.Plans, full: true })}
          className="w-full"
        >
          <Button size="large" className="text w-full">
            {intl("book-lesson.subscription-dialog.btn-1")}
          </Button>
        </Link>
      </div>

      <div className="flex w-full text-center mt-2">
        <Link
          to={LITESPACE_SUPPORT_URL}
          className="text w-full font-normal text-caption text-natural-700 underline"
        >
          {intl("book-lesson.subscription-dialog.btn-3")}
        </Link>
      </div>
    </Dialog>
  );
};

export default SubscriptionDialog;
