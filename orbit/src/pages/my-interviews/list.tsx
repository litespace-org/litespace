import { IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  UrlField,
} from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Space, Table } from "antd";
import React from "react";

export const MyInterviewList: React.FC = () => {
  const { data: user } = useGetIdentity<IUser.Self>();
  const { tableProps } = useTable<IUser.Self[]>({
    syncWithLocation: true,
    meta: { id: user?.id },
  });

  console.log({ tableProps });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="attendeeEmail" title="Tutor Email" />
        <Table.Column dataIndex="attendeeName" title="Name" />
        <Table.Column
          dataIndex="meetingUrl"
          title="Interview URL"
          render={(value: string) => <UrlField value={value} />}
        />
        <Table.Column
          dataIndex="start"
          title="Start Time"
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
