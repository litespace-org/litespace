import { ITutor, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  BooleanField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";

export const TutorList: React.FC = () => {
  const { tableProps } = useTable<ITutor.FullTutor[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          dataIndex="passedInterview"
          title="Passed Interview"
          render={(value: boolean) => <BooleanField value={value} />}
        />

        <Table.Column
          dataIndex="activated"
          title="Activated"
          render={(value: boolean) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created at"
          render={(value: string) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          dataIndex="udpatedAt"
          title="Updated At"
          render={(value: string) => <DateField value={value} format="LLL" />}
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
