import { backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import { DeleteButton, List, UrlField, useTable } from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";

export const AssetList: React.FC = () => {
  const { tableProps } = useTable<string[]>({
    syncWithLocation: true,
  });

  return (
    <List title="Server Assets">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="index" title="Index" />
        <Table.Column
          dataIndex="name"
          title="Name"
          render={(value) => (
            <UrlField
              target="_blank"
              value={value}
              href={asAssetUrl(backend, value)}
            />
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: { name: string }) => (
            <Space>
              <DeleteButton hideText size="small" recordItemId={record.name} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
