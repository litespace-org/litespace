import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Table } from "@litespace/ui/Table";
import { Typography } from "@litespace/ui/Typography";
import { ILesson, ITransaction } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useRender } from "@litespace/headless/common";
import { price } from "@litespace/utils";
import { useFindRefundableLessons } from "@litespace/headless/lessons";
import RefundDialog from "@/components/StudentSettings/RefundDialog";
import { isEmpty } from "lodash";
import EmptyInvoices from "@litespace/assets/EmptyInvoices";

type TableRow = {
  type: ITransaction.Type;
  createdAt: string;
  price: number;
  paymentMethod: ITransaction.PaymentMethod;
  status: ITransaction.Status;
  terminateAt: string;
  txId: ILesson.MetaSelf["txId"] | null;
  orderRefNum: ILesson.MetaSelf["orderRefNum"] | null;
};

const RefundsTable: React.FC = () => {
  const intl = useFormatMessage();
  const refundDialog = useRender();

  const refundableLessons = useFindRefundableLessons();

  // the transaction to be refunded
  const [txInfo, setTxInfo] = useState<{
    id: ITransaction.Self["id"];
    orderRefNum: ITransaction.Self["providerRefNum"];
  } | null>(null);

  const rows = useMemo<TableRow[]>(() => {
    const list = refundableLessons.data?.map((lesson) => ({
      type: lesson.txType,
      createdAt: lesson.txCreatedAt,
      price: lesson.txAmount,
      paymentMethod: lesson.txPaymentMethod,
      status: lesson.txStatus,
      terminateAt: lesson.start,
      txId: lesson.txId,
      orderRefNum: lesson.orderRefNum,
    }));
    return list || [];
  }, [refundableLessons.data]);

  const columnHelper = createColumnHelper<TableRow>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: intl("student-settings.refunds-table.type"),
        cell: (info) => {
          if (info.getValue() === ITransaction.Type.PaidLesson) {
            return (
              <Typography tag="span">
                {intl("student-settings.refunds-table.type.lesson")}
              </Typography>
            );
          }
          return (
            <Typography tag="span">
              {intl("student-settings.refunds-table.type.subscription")}
            </Typography>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: intl("student-settings.refunds-table.created-at"),
        cell: (info) => dayjs(info.row.original.createdAt).format("D/MM/YYYY"),
      }),
      columnHelper.accessor("price", {
        header: intl("student-settings.refunds-table.price"),
        cell: (info) => (
          <Typography tag="span">
            {intl("plan.price", {
              value: price.unscale(info.getValue()),
            })}
          </Typography>
        ),
      }),
      /* TODO: add this column once the specs are clear
      columnHelper.accessor("status", {
        header: intl("student-settings.refunds-table.status"),
        cell: (info) => info.getValue(),
      }),
      */
      columnHelper.accessor("paymentMethod", {
        header: intl("student-settings.refunds-table.payment-method"),
        cell: (info) => {
          const value = info.getValue();
          if (value === ITransaction.PaymentMethod.Card) {
            return (
              <Typography tag="span">
                {intl("student-settings.refunds-table.payment-method.card")}
              </Typography>
            );
          }
          if (value === ITransaction.PaymentMethod.EWallet) {
            return (
              <Typography tag="span">
                {intl("student-settings.refunds-table.payment-method.ewallet")}
              </Typography>
            );
          }
          if (value === ITransaction.PaymentMethod.Fawry) {
            return (
              <Typography tag="span">
                {intl("student-settings.refunds-table.payment-method.fawry")}
              </Typography>
            );
          }
        },
      }),
      columnHelper.accessor("terminateAt", {
        header: intl("student-settings.refunds-table.terminated-at"),
        cell: (info) =>
          dayjs(info.row.original.terminateAt).format("D/MM/YYYY"),
      }),
      columnHelper.display({
        id: "action",
        header: intl("student-settings.refunds-table.action"),
        cell: (info) => {
          const data = info.row.original;
          return (
            <Button
              variant="bold"
              size="medium"
              className="mt-4 w-full"
              disabled={
                data.status === ITransaction.Status.Refunding ||
                data.status === ITransaction.Status.PartialRefunded ||
                data.status === ITransaction.Status.Refunded
              }
              onClick={() => {
                refundDialog.show();
                setTxInfo({
                  id: data.txId || -1,
                  orderRefNum: data.orderRefNum || "",
                });
              }}
            >
              {intl("student-settings.refunds-table.action.refund")}
            </Button>
          );
        },
      }),
    ],
    [columnHelper, refundDialog, intl]
  );

  if (isEmpty(refundableLessons.data))
    return (
      <div className="flex justify-center items-center w-full h-full">
        <EmptyInvoices />
      </div>
    );

  return (
    <div className="w-full">
      <Table
        columns={columns}
        data={rows}
        fetching={refundableLessons.isFetching}
        loading={refundableLessons.isLoading}
        textAlign="middle-center"
      />

      {/* refundDialog.open is important here to prevent within query requests */}
      {txInfo?.orderRefNum && txInfo?.id && refundDialog.open ? (
        <RefundDialog
          isOpen={refundDialog.open}
          txId={txInfo.id}
          orderRefNum={txInfo.orderRefNum}
          close={refundDialog.hide}
        />
      ) : null}
    </div>
  );
};

export default RefundsTable;
