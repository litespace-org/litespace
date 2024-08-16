import { IInterview, IUser } from "@litespace/types";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TextField,
  BooleanField,
  UrlField,
} from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const MyInterviewsList: React.FC = () => {
  const { data: user } = useGetIdentity<IUser.Self>();
  const { tableProps } = useTable<IInterview.Self[]>({
    syncWithLocation: true,
    meta: { id: user?.id },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["ids", "interviewee"]}
          title="Interviewee"
          render={(value: number) => (
            <UrlField href={`/users/show/${value}`} value={`# ${value}`} />
          )}
        />

        <Table.Column
          dataIndex="passed"
          title="Passed Interview"
          render={(value: boolean | null) =>
            value === null ? (
              <TextField value="Never set" />
            ) : (
              <BooleanField
                value={value}
                title={value ? "Passed" : "Rejected"}
              />
            )
          }
        />

        <Table.Column
          dataIndex="approved"
          title="Approved"
          render={(value: boolean | null) =>
            value === null ? (
              <TextField value="Never set" />
            ) : (
              <BooleanField
                value={value}
                title={value ? "Passed" : "Rejected"}
              />
            )
          }
        />

        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(value: string) => <TextField value={value} />}
        />

        <Table.Column
          dataIndex="udpatedAt"
          title="Updated At"
          render={(value: string) => (
            <TextField value={dayjs(value).fromNow()} />
          )}
        />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: IInterview.Self) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.ids.self}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record.ids.self}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
