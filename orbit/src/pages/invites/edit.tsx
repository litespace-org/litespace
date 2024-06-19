import { ICoupon, IInvite, IPlan } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Flex, Form, Input, InputNumber, Select } from "antd";
import { useOne, useResource } from "@refinedev/core";
import { PercentageOutlined } from "@ant-design/icons";
import { discountFormatter, discountParser, formatDuration } from "@/lib/utils";
import { Resource } from "@/providers/data";
import { required } from "@/lib/constants";
import { useMemo } from "react";
import dayjs from "dayjs";

export const InviteEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading: isCouponLoading } = useOne<IInvite.MappedAttributes>(
    { resource: resource?.name, id }
  );

  const { formProps, saveButtonProps, formLoading } =
    useForm<ICoupon.MappedAttributes>({
      meta: { invite: data?.data },
    });

  const { selectProps } = useSelect<IPlan.MappedAttributes>({
    resource: Resource.Plans,
    optionLabel: ((item: IPlan.MappedAttributes) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `#${item.id} ${item.alias} - ${formatDuration(item.weeklyMinutes)}`) as any,
    optionValue: "id",
    searchField: "alias",
    sorters: [{ field: "id", order: "asc" }],
  });

  const updatedFormProps = useMemo(
    () => ({
      ...formProps,
      initialValues: {
        ...formProps.initialValues,
        expiresAt: formProps.initialValues
          ? dayjs(formProps.initialValues.expiresAt)
          : undefined,
      },
    }),
    [formProps]
  );

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || isCouponLoading}
    >
      <Form {...updatedFormProps} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            required,
            {
              pattern: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
              message: "Invalid email",
            },
          ]}
        >
          <Input size="large" autoComplete="username" />
        </Form.Item>

        <Form.Item label="Target Plan" name="planId">
          <Select
            placeholder="Select a plan"
            style={{ width: "420px" }}
            {...selectProps}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Expires At" name="expiresAt" rules={[required]}>
          <DatePicker size="large" style={{ width: "420px" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
