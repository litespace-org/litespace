import { Create, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Flex, Form, Input, InputNumber, Select } from "antd";
import { required } from "@/lib/constants";
import { PercentageOutlined } from "@ant-design/icons";
import { discountFormatter, discountParser, formatDuration } from "@/lib/utils";
import { Resource } from "@/providers/data";
import { IPlan } from "@litespace/types";

export const CouponCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

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
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item label="Code" name="code" rules={[required]}>
          <Input size="large" />
        </Form.Item>
        <Flex gap="20px">
          <Form.Item
            label="Full Month Discount"
            name="fullMonthDiscount"
            initialValue={0}
          >
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discountFormatter}
              parser={discountParser}
              min="0"
            />
          </Form.Item>

          <Form.Item
            label="Full Quarter Discount"
            name="fullQuarterDiscount"
            initialValue={0}
          >
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
          <Form.Item
            label="Half Year Discount"
            name="halfYearDiscount"
            initialValue={0}
          >
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discountFormatter}
              parser={discountParser}
              min="0"
            />
          </Form.Item>

          <Form.Item
            label="Full Year Discount"
            name="fullYearDiscount"
            initialValue={0}
          >
            <InputNumber
              size="large"
              addonBefore={<PercentageOutlined />}
              style={{ width: "200px" }}
              formatter={discountFormatter}
              parser={discountParser}
            />
          </Form.Item>
        </Flex>

        <Form.Item label="Target Plan" name="planId" rules={[required]}>
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
    </Create>
  );
};
