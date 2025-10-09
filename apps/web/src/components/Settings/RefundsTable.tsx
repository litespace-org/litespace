import EmptyInvoices from "@litespace/assets/EmptyInvoices";
import { useFindRefundableLessons } from "@litespace/headless/lessons";
import { ILesson, ITransaction } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import cn from "classnames";
import { calculateLessonPrice, dayjs, price } from "@litespace/utils";
import { useUser } from "@litespace/headless/context/user";
import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/headless/common";
import RefundDialog from "@/components/StudentSettings/RefundDialog";

const RefundsTable: React.FC = () => {
  const intl = useFormatMessage();

  const lessons = useFindRefundableLessons();
  const canceledLessons = useMemo(
    () => lessons.data?.filter((l) => l.canceledAt) || [],
    [lessons.data]
  );
  const reportedLessons = useMemo(
    () => lessons.data?.filter((l) => l.reported) || [],
    [lessons.data]
  );

  if (isEmpty(canceledLessons) && isEmpty(reportedLessons))
    return (
      <div className="flex justify-center items-center w-full h-full">
        <EmptyInvoices />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {!isEmpty(canceledLessons) ? (
        <LessonList
          title={intl("student-settings.refunds.canceled-lessons")}
          list={canceledLessons}
        />
      ) : null}

      {!isEmpty(reportedLessons) ? (
        <LessonList
          title={intl("student-settings.refunds.reported-lessons")}
          list={reportedLessons}
        />
      ) : null}
    </div>
  );
};

export default RefundsTable;

const LessonList: React.FC<{
  title: string;
  list: ILesson.MetaSelf[];
  className?: string;
}> = ({ title, list, className }) => {
  return (
    <div className={cn("flex flex-col gap-4 sm:max-w-[325px]", className)}>
      <Typography tag="h2" className="text-subtitle-2 font-semibold">
        {title}
      </Typography>
      <div className="flex flex-col gap-2">
        {list.map((lesson, i) => (
          <LessonRow key={i} data={lesson} />
        ))}
      </div>
    </div>
  );
};

const LessonRow: React.FC<{ data: ILesson.MetaSelf }> = ({ data }) => {
  const intl = useFormatMessage();
  const { user } = useUser();
  const refundDialog = useRender();

  const buttonLabel = useMemo(() => {
    if (data.txStatus === ITransaction.Status.Paid)
      return (
        <Typography tag="span">
          {intl("student-settings.refunds.button.refund")}
        </Typography>
      );

    if (data.txStatus === ITransaction.Status.Refunded)
      return (
        <Typography tag="span" className="text-success-700">
          {intl("student-settings.refunds.button.refunded")}
        </Typography>
      );

    if (data.txStatus === ITransaction.Status.PartialRefunded)
      return (
        <Typography tag="span" className="text-success-700">
          {intl("student-settings.refunds.button.refunded")}
        </Typography>
      );

    if (data.txStatus === ITransaction.Status.Refunding)
      return (
        <Typography tag="span" className="text-warning-700">
          {intl("student-settings.refunds.button.refunding")}
        </Typography>
      );
  }, [data.txStatus, intl]);

  return (
    <div className="flex flex-col justify-around border border-natural-100 bg-natural-0 rounded-lg p-4">
      {data.canceledBy ? (
        <Typography tag="span" className="text-lg font-medium mb-1">
          {intl("student-settings.refunds.canceled-by", {
            by:
              data.canceledBy !== user?.id
                ? intl("labels.tutor")
                : intl("labels.student"),
          })}
        </Typography>
      ) : null}

      {!data.canceledBy ? (
        <Typography tag="span" className="text-lg font-medium mb-1">
          {intl("student-settings.refunds.canceled-by", {
            by: intl("labels.student"),
          })}
        </Typography>
      ) : null}

      {data.canceledAt ? (
        <Typography tag="span" className="text-caption">
          {intl("student-settings.refunds.cancel-time", {
            time: dayjs(data.canceledAt).format("D MMM YYYY - hh:MM A"),
          })}
        </Typography>
      ) : null}

      <Typography tag="span" className="text-normal mt-2">
        {intl("student-settings.refunds.lesson-price", {
          price: price.unscale(calculateLessonPrice(data.duration)),
        })}
      </Typography>

      <Button
        variant="bold"
        size="medium"
        className="mt-4 w-full"
        disabled={
          data.txStatus === ITransaction.Status.Refunding ||
          data.txStatus === ITransaction.Status.PartialRefunded ||
          data.txStatus === ITransaction.Status.Refunded
        }
        onClick={refundDialog.show}
      >
        {buttonLabel}
      </Button>

      {data.orderRefNum && data.txId ? (
        <RefundDialog
          isOpen={refundDialog.open}
          txId={data.txId}
          orderRefNum={data.orderRefNum}
          close={refundDialog.hide}
        />
      ) : null}
    </div>
  );
};
