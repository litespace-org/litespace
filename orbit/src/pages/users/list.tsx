import { IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  TextField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const UserList: React.FC = () => {
  const { tableProps } = useTable<IUser.Self[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          title="Name"
          render={(record: IUser.Self) => (
            <TextField
              value={`${record.name.en || "-"} (${record.name.ar || "-"})`}
            />
          )}
        />
        <Table.Column
          dataIndex="role"
          title="Role"
          render={(value) => <TagField value={value} />}
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
          dataIndex="updatedAt"
          title="Updated At"
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
