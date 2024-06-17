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
import { formatEgp, formatPercent } from "@/lib/format";
import {
  applyDiscount,
  formatDuration,
  unscaleDiscount,
  unscalePrice,
} from "@/lib/utils";

export type TableRow = {
  name: string;
  value: boolean | number | string | null | undefined;
  type?: "tag" | "boolean" | "date" | "url" | "price" | "discount" | "duration";
  href?: string;
  original?: number;
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

          if (record.type === "url")
            return <UrlField value={value} href={record.href} />;

          if (record.type === "date")
            return (
              <>
                <DateField value={value} format="LLL" /> -{" "}
                <TextField value={dayjs(value).fromNow()} />
              </>
            );

          if (record.type === "price")
            return <TextField value={formatEgp(unscalePrice(value))} />;

          if (record.type === "discount") {
            const original = record.original || 0;
            return (
              <>
                <TextField value={formatPercent(unscaleDiscount(value))} />
                <br />
                (Original:{" "}
                <TextField
                  value={formatEgp(unscalePrice(original))}
                  strong
                  italic
                />
                , After:{" "}
                <TextField
                  value={formatEgp(
                    applyDiscount(unscalePrice(original), value)
                  )}
                  strong
                  italic
                />
                )
              </>
            );
          }

          if (record.type === "duration")
            return <TextField value={formatDuration(value)} />;

          return <TextField value={value} strong />;
        }}
      />
    </Table>
  );
};

export default TableView;
