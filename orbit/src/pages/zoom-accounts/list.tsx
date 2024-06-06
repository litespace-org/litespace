import { IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  NumberField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";

export const ZoomAccountList: React.FC = () => {
  const { tableProps } = useTable<IUser.Self[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex={["createdAt"]}
          title={"Created at"}
          render={(value: string) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          dataIndex={"remainingApiCalls"}
          title="Remaining API Calls"
          render={(value: number) => <NumberField value={value} />}
        />
        <Table.Column
          dataIndex={["udpatedAt"]}
          title={"Updated At"}
          render={(value: string) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          title={"Actions"}
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
