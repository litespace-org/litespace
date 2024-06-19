import { formatPercent } from "@/lib/format";
import { unscaleDiscount } from "@/lib/utils";
import { ICoupon, IReport, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TextField,
  UrlField,
  BooleanField,
} from "@refinedev/antd";
import { Flex, Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const ReportList: React.FC = () => {
  const { tableProps } = useTable<ICoupon.MappedAttributes[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />

        <Table.Column
          title="Reporter"
          render={(report: IReport.MappedAttributes) => (
            <UrlField
              value={report.createdBy.email}
              href={`/users/show/${report.createdBy.id}`}
            />
          )}
        />

        <Table.Column
          dataIndex="title"
          title="Title"
          render={(value: string) => <TextField value={value} strong />}
        />
        <Table.Column dataIndex="category" title="Category" />
        <Table.Column
          title="Resolved"
          dataIndex="resolved"
          render={(value: ICoupon.MappedAttributes) => (
            <BooleanField
              value={value}
              title={value ? "Resovled" : "Not yet resolved"}
            />
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(value: string) => (
            <>
              <DateField value={value} format="LLL" /> <br />
              (<TextField value={dayjs(value).fromNow()} />)
            </>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: IUser.Self) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
