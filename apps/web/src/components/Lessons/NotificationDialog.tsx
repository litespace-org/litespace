import { router } from "@/lib/routes";
import Notification from "@litespace/assets/Notification";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";

export const NotificationsDialog: React.FC<{
  open: boolean;
  close: Void;
}> = ({ open, close }) => {
  const intl = useFormatMessage();

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <div className="w-12 h-12 bg-brand-50 rounded-full overflow-hidden flex items-center justify-center">
          <Notification className="relative w-6 h-6 [&>*]:stroke-brand-500 bg-brand-100 rounded-full overflow-hidden p-1" />
        </div>
      }
    >
      <div className="flex flex-col gap-1 mt-4 mb-6">
        <Typography
          tag="p"
          className="text-body font-semibold text-natural-950"
        >
          {intl("book-lesson.success.activate-notifications.desc")}
        </Typography>
        <List />
      </div>
      <div className="flex gap-3">
        <Button
          size="large"
          variant="secondary"
          className="text flex-1"
          onClick={close}
        >
          {intl("labels.not-now")}
        </Button>
        <Button size="large" className="text flex-1">
          <Link
            to={router.web({
              route: Web.StudentSettings,
              query: { tab: "notifications" },
            })}
          >
            {intl("labels.enable-notifications")}
          </Link>
        </Button>
      </div>
    </Dialog>
  );
};

const LIST_ITEMS: LocalId[] = [
  "book-lesson.success.activate-notifications.benefits-1",
  "book-lesson.success.activate-notifications.benefits-2",
  "book-lesson.success.activate-notifications.benefits-3",
  "book-lesson.success.activate-notifications.benefits-4",
];

const List: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col">
      {LIST_ITEMS.map((item, idx) => {
        return (
          <div key={idx} className="flex items-center">
            <div className="bg-natural-700 w-1 h-1 overflow-hidden mx-2" />
            <Typography
              tag="p"
              className="text-caption font-regular text-natural-700"
            >
              {intl(item)}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};
