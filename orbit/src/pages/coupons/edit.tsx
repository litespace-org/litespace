import { ICoupon, IPlan } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Input, InputNumber, Select } from "antd";
import { useOne, useResource } from "@refinedev/core";
import { PercentageOutlined } from "@ant-design/icons";
import { discountFormatter, discountParser, formatDuration } from "@/lib/utils";
import { Resource } from "@/providers/data";

export const CouponEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading: isCouponLoading } = useOne<ICoupon.MappedAttributes>(
    { resource: resource?.name, id }
  );

  const { formProps, saveButtonProps, formLoading } =
    useForm<ICoupon.MappedAttributes>({
      meta: { coupon: data?.data },
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

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || isCouponLoading}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code">
          <Input size="large" />
        </Form.Item>
        <Flex gap="20px">
          <Form.Item label="Full Month Discount" name="fullMonthDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discountFormatter}
              parser={discountParser}
              min="0"
            />
          </Form.Item>

          <Form.Item label="Full Quarter Discount" name="fullQuarterDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discountFormatter}
              parser={discountParser}
              min="0"
            />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item label="Half Year Discount" name="halfYearDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discountFormatter}
              parser={discountParser}
              min="0"
            />
          </Form.Item>

          <Form.Item label="Full Year Discount" name="fullYearDiscount">
            <InputNumber
              size="large"
              addonBefore={<PercentageOutlined />}
              style={{ width: "200px" }}
              formatter={discountFormatter}
              parser={discountParser}
            />
          </Form.Item>
        </Flex>

        <Form.Item label="Target Plan" name="planId">
          <Select
            placeholder="Select a plan"
            style={{ width: "420px" }}
            {...selectProps}
            size="large"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
