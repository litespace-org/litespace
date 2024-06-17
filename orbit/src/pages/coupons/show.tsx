import { ICoupon, IPlan, IUser } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useLink, useOne, useShow } from "@refinedev/core";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { Button } from "antd";
import { Resource } from "@/providers/data";
import { UserOutlined } from "@ant-design/icons";
import { formatDuration } from "@/lib/utils";

export const CouponShow = () => {
  const {
    queryResult: { data, isLoading: isCouponLoading },
  } = useShow<ICoupon.MappedAttributes>({});

  const coupon = useMemo(() => data?.data, [data?.data]);

  const { data: planData, isError: isPlanLoading } =
    useOne<IPlan.MappedAttributes>({
      resource: Resource.Plans,
      id: coupon?.planId,
    });

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!coupon) return [];
    return [
      { name: "ID", value: coupon.id },
      { name: "Code", value: coupon.code },
      {
        name: "Plan",
        value: `#${coupon.planId} - ${formatDuration(planData?.data.weeklyMinutes || 0)}`,
        href: `/plans/show/${coupon.planId}`,
        type: "url",
      },
      {
        name: "Full Month Discount",
        value: coupon.fullMonthDiscount,
        type: "discount",
        original: planData?.data.fullMonthPrice,
      },
      {
        name: "Full Quarter Discount",
        value: coupon.fullQuarterDiscount,
        type: "discount",
        original: planData?.data.fullQuarterPrice,
      },
      {
        name: "Half-Year Discount",
        value: coupon.halfYearDiscount,
        type: "discount",
        original: planData?.data.halfYearPrice,
      },
      {
        name: "Full-Year Discount",
        value: coupon.fullYearDiscount,
        type: "discount",
        original: planData?.data.fullYearPrice,
      },
      { name: "Created At", value: coupon.createdAt, type: "date" },
      {
        name: "Created By",
        value: coupon.createdBy.email,
        type: "url",
        href: `/users/show/${coupon.createdBy.id}`,
      },
      { name: "Updated At", value: coupon.updatedAt, type: "date" },
      {
        name: "Updated By",
        value: coupon.updatedBy.email,
        type: "url",
        href: `/users/show/${coupon.updatedBy.id}`,
      },
    ];
  }, [
    coupon,
    planData?.data.fullMonthPrice,
    planData?.data.fullQuarterPrice,
    planData?.data.fullYearPrice,
    planData?.data.halfYearPrice,
    planData?.data.weeklyMinutes,
  ]);

  return (
    <Show isLoading={isCouponLoading || isPlanLoading} title="Coupon">
      <TableView dataSource={dataSoruce} />
    </Show>
  );
};
