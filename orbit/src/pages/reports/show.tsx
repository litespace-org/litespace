import { IReport } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";

export const ReportShow = () => {
  const {
    queryResult: { data, isLoading: isCouponLoading },
  } = useShow<IReport.MappedAttributes>({});

  const report = useMemo(() => data?.data, [data?.data]);

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!report) return [];
    return [
      { name: "ID", value: report.id },
      {
        name: "Reported By",
        value: report.createdBy.email,
        type: "url",
        href: `/users/show/${report.createdBy.id}`,
      },
      { name: "Title", value: report.title },
      { name: "Description", value: report.description },
      { name: "Category", value: report.category },
      {
        name: "Resovled",
        value: report.resolved,
        type: "boolean",
        helper: report.resolved ? "Resolved" : "Not resolved yet",
      },
      { name: "Resovled At", value: report.resolvedAt, type: "date" },
      { name: "Updated At", value: report.updatedAt, type: "date" },
      {
        name: "Updated By",
        value: report.updatedBy.email,
        type: "url",
        href: `/users/show/${report.updatedBy.id}`,
      },
    ];
  }, [report]);

  return (
    <Show isLoading={isCouponLoading} title="Report">
      <TableView dataSource={dataSoruce} />
    </Show>
  );
};
