import { formatPercent } from "@/lib/format";
import { unscaleDiscount } from "@/lib/utils";
import { ICoupon, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  TextField,
  UrlField,
} from "@refinedev/antd";
import { Flex, Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";

export const CouponList: React.FC = () => {
  const { tableProps } = useTable<ICoupon.MappedAttributes[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column
          dataIndex="code"
          title="Code"
          render={(value: string) => <TextField value={value} strong />}
        />
        <Table.Column
          dataIndex="planId"
          title="Plan"
          render={(value: number) => (
            <UrlField value={`#${value}`} href={`/plans/show/${value}`} />
          )}
        />
        <Table.Column
          title="Discount"
          render={(value: ICoupon.MappedAttributes) => {
            const list = [
              { label: "Month", value: value.fullMonthDiscount },
              { label: "Quarter", value: value.fullQuarterDiscount },
              { label: "Half-Year", value: value.halfYearDiscount },
              { label: "Full-Year", value: value.fullYearDiscount },
            ];

            return (
              <>
                {list.map((item) => (
                  <Flex gap="8px" key={item.label}>
                    <TextField value={item.label} />
                    <TextField
                      value={formatPercent(unscaleDiscount(item.value))}
                      strong
                    />
                  </Flex>
                ))}
              </>
            );
          }}
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
