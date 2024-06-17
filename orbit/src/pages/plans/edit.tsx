import { IPlan } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { Flex, Form, InputNumber, Switch } from "antd";
import { useOne, useResource } from "@refinedev/core";
import { useMemo } from "react";
import {
  asDurationParts,
  discountFormatter,
  discountParser,
  priceFormatter,
  priceParser,
} from "@/lib/utils";
import { PercentageOutlined } from "@ant-design/icons";
import Coin from "@/icons/Coin";

export const PlanEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading } = useOne<IPlan.Attributed>({
    resource: resource?.name,
    id,
  });

  const { formProps, saveButtonProps, formLoading } = useForm<IPlan.Attributed>(
    { meta: { plan: data?.data } }
  );

  const plan = useMemo(() => data?.data, [data?.data]);

  const [hours, minutes] = useMemo(
    () => asDurationParts(plan?.weeklyMinutes || 0),
    [plan?.weeklyMinutes]
  );

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || isLoading}
    >
      <Form {...formProps} layout="vertical">
        <Flex gap="20px">
          <Form.Item label="Hours" name="hours" initialValue={hours}>
            <InputNumber size="large" min={0} style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item label="Minutes" name="minutes" initialValue={minutes}>
            <InputNumber size="large" min={0} style={{ width: "200px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item label="Full Month Price" name="fullMonthPrice">
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
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
        </Flex>

        <Flex gap="20px">
          <Form.Item label="Full Quarter Price" name="fullQuarterPrice">
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
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
          <Form.Item label="Half Year Price" name="halfYearPrice">
            <InputNumber
              size="large"
              addonBefore={<Coin width={20} />}
              style={{ width: "200px" }}
              formatter={priceFormatter}
              parser={priceParser}
              min="0"
            />
          </Form.Item>
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
        </Flex>

        <Flex gap="20px">
          <Form.Item label="Full Year Price" name="fullYearPrice">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<Coin width={20} />}
              formatter={priceFormatter}
              parser={priceParser}
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

        <Form.Item label="Active" name="active">
          <Switch />
        </Form.Item>
        <Form.Item label="For Invites Only" name="forInvitesOnly">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
