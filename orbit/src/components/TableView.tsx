import {
  BooleanField,
  DateField,
  TagField,
  TextField,
  UrlField,
} from "@refinedev/antd";
import { Table } from "antd";
import React from "react";
import dayjs from "@/lib/dayjs";

export type TableRow = {
  name: string;
  value: boolean | number | string | null | undefined;
  type?: "tag" | "boolean" | "date" | "url";
};

const TableView: React.FC<{ dataSource: TableRow[] }> = ({ dataSource }) => {
  return (
    <Table<TableRow> dataSource={dataSource} key="name" pagination={false}>
      <Table.Column title="Field" dataIndex="name" width="20%" />
      <Table.Column
        title="Value"
        dataIndex="value"
        render={(value, record: TableRow) => {
          if (record.type === "tag")
            return <TagField value={value || "unspecified"} />;

          if (record.type === "boolean") return <BooleanField value={value} />;

          if (record.type === "url") return <UrlField value={value} />;

          if (record.type === "date")
            return (
              <>
                <DateField value={value} format="LLL" /> -{" "}
                <TextField value={dayjs(value).fromNow()} />
              </>
            );

          return value;
        }}
      />
    </Table>
  );
};

export default TableView;
