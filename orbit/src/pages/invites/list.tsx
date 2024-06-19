import { ICoupon, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TextField,
  UrlField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const InviteList: React.FC = () => {
  const { tableProps } = useTable<ICoupon.MappedAttributes[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />

        <Table.Column
          dataIndex="email"
          title="Email"
          render={(value: string) => <TextField value={value} strong />}
        />

        <Table.Column
          dataIndex="planId"
          title="Plan"
          render={(value: number) => (
            <UrlField value={`#${value}`} href={`/plans/show/${value}`} />
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
          dataIndex="expiresAt"
          title="Expires At"
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
