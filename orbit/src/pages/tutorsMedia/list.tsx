import { ITutor, IUser } from "@litespace/types";
import {
  BooleanField,
  EditButton,
  List,
  ShowButton,
  TextField,
  useTable,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";

export const TutorMediaList: React.FC = () => {
  const { tableProps } = useTable<ITutor.TutorMedia[]>({
    syncWithLocation: true,
  });

  return (
    <List title="Tutors Media">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          title="Name"
          render={(record: ITutor.TutorMedia) => (
            <TextField
              value={`${record.name.en || "-"} (${record.name.ar || "-"})`}
            />
          )}
        />
        <Table.Column dataIndex="phoneNumber" title="Phone Number" />
        <Table.Column
          title="Done"
          render={(_, record: ITutor.TutorMedia) => (
            <BooleanField
              value={!!record.photo && !!record.video}
              valueLabelTrue="Has photo and video"
              valueLabelFalse="Not yet has photo and video"
            />
          )}
        />
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
