import { Create, useForm } from "@refinedev/antd";
import { Flex, Form, Input, InputNumber, Switch } from "antd";
import Coin from "@/icons/Coin";
import {
  discountFormatter,
  discountParser,
  priceFormatter,
  priceParser,
} from "@/lib/utils";
import { PercentageOutlined } from "@ant-design/icons";
import { required } from "@/lib/constants";

export const PlanCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item label="Alias" name="alias" rules={[required]}>
          <Input size="large" />
        </Form.Item>
        <Flex gap="20px">
          <Form.Item
            label="Hours"
            name="hours"
            initialValue={1}
            rules={[required]}
          >
            <InputNumber size="large" min={0} style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item
            label="Minutes"
            name="minutes"
            initialValue={30}
            rules={[required]}
          >
            <InputNumber size="large" min={0} style={{ width: "200px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item
            label="Full Month Price"
            name="fullMonthPrice"
            rules={[required]}
          >
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
          <Form.Item
            label="Full Month Discount"
            name="fullMonthDiscount"
            rules={[required]}
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
            label="Full Quarter Price"
            name="fullQuarterPrice"
            rules={[required]}
          >
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
          <Form.Item
            label="Full Quarter Discount"
            name="fullQuarterDiscount"
            rules={[required]}
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
            label="Half Year Price"
            name="halfYearPrice"
            rules={[required]}
          >
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
          <Form.Item
            label="Half Year Discount"
            name="halfYearDiscount"
            rules={[required]}
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
            label="Full Year Price"
            name="fullYearPrice"
            rules={[required]}
          >
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<Coin width={20} />}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
          <Form.Item
            label="Full Year Discount"
            name="fullYearDiscount"
            rules={[required]}
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

        <Form.Item
          label="Active"
          name="active"
          layout="horizontal"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="For Invites Only"
          name="forInvitesOnly"
          layout="horizontal"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
