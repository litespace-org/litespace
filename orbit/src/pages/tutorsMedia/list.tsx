import { ITutor, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  BooleanField,
  TextField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";
import dayjs from "@/lib/dayjs";

export const TutorMediaList: React.FC = () => {
  const { tableProps } = useTable<ITutor.TutorMedia[]>({
    syncWithLocation: true,
  });

  return (
    <List title="Tutors Media">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="phoneNumber" title="Phone Number" />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: IUser.Self) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
