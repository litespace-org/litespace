import { ICoupon, IInvite, IPlan } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { Resource } from "@/providers/data";
import { formatDuration } from "@/lib/utils";

export const InviteShow = () => {
  const {
    queryResult: { data, isLoading: isCouponLoading },
  } = useShow<IInvite.MappedAttributes>({});

  const invite = useMemo(() => data?.data, [data?.data]);

  const { data: planData, isError: isPlanLoading } =
    useOne<IPlan.MappedAttributes>({
      resource: Resource.Plans,
      id: invite?.planId,
    });

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!invite) return [];
    return [
      { name: "ID", value: invite.id },
      { name: "Email", value: invite.email },
      {
        name: "Plan",
        value: `#${invite.planId} ${planData?.data.alias} - ${formatDuration(planData?.data.weeklyMinutes || 0)}`,
        href: `/plans/show/${invite.planId}`,
        type: "url",
      },
      { name: "Expires At", value: invite.expiresAt, type: "date" },
      { name: "Created At", value: invite.createdAt, type: "date" },
      {
        name: "Created By",
        value: invite.createdBy.email,
        type: "url",
        href: `/users/show/${invite.createdBy.id}`,
      },
      { name: "Updated At", value: invite.updatedAt, type: "date" },
      {
        name: "Updated By",
        value: invite.updatedBy.email,
        type: "url",
        href: `/users/show/${invite.updatedBy.id}`,
      },
    ];
  }, [invite, planData?.data.alias, planData?.data.weeklyMinutes]);

  return (
    <Show isLoading={isCouponLoading || isPlanLoading} title="Invite">
      <TableView dataSource={dataSoruce} />
    </Show>
  );
};
