import { Resource } from "@/providers/data";
import { IPlan, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  TextField,
  BooleanField,
  UrlField,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const PlanList: React.FC = () => {
  const { tableProps } = useTable<IPlan.MappedAttributes[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="weeklyMinutes" title="Weekly Minutes" />
        <Table.Column
          dataIndex="active"
          title="Active"
          render={(value: string) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="forInvitesOnly"
          title="Invites Only"
          render={(value: string) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex={["createdBy", "email"]}
          title="Created By"
          render={(value: string, record: IPlan.MappedAttributes) => (
            <UrlField
              value={value}
              href={`/users/show/${record.createdBy.id}`}
            />
          )}
        />
        <Table.Column
          dataIndex={["updatedBy", "email"]}
          title="Updated By"
          render={(value: string, record: IPlan.MappedAttributes) => (
            <UrlField
              value={value}
              href={`/users/show/${record.updatedBy.id}`}
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
