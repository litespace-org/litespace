import { IPlan, IUser } from "@litespace/types";
import { Edit, TextField, useForm } from "@refinedev/antd";
import {
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { genders, userTypes } from "@/lib/constants";
import { useOne, useResource } from "@refinedev/core";
import { useMemo } from "react";
import {
  asDurationParts,
  scaleDiscount,
  scalePrice,
  unscaleDiscount,
  unscalePrice,
} from "@/lib/utils";
import { PercentageOutlined } from "@ant-design/icons";
import Coin from "@/icons/Coin";
import { formatEgp, formatPercent } from "@/lib/format";

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

  const discount = useMemo(
    () => ({
      parser: (value?: string) => {
        if (!value) return "0";
        return scaleDiscount(Number(value.replace(/%|,/gi, ""))).toString();
      },
      formatter: (value?: string) => {
        return formatPercent(value ? unscaleDiscount(Number(value)) : 0);
      },
    }),
    []
  );

  const price = useMemo(
    () => ({
      parser: (value?: string) => {
        if (!value) return "0";
        return scalePrice(
          Number(value.replace(/E|G|P|,/gi, "").trim())
        ).toString();
      },
      formatter: (value?: string) => {
        return formatEgp(value ? unscalePrice(Number(value)) : 0);
      },
    }),
    []
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
              formatter={price.formatter}
              parser={price.parser}
              min="0"
            />
          </Form.Item>
          <Form.Item label="Full Month Discount" name="fullMonthDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discount.formatter}
              parser={discount.parser}
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
              formatter={price.formatter}
              parser={price.parser}
              min="0"
            />
          </Form.Item>
          <Form.Item label="Full Quarter Discount" name="fullQuarterDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discount.formatter}
              parser={discount.parser}
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
              formatter={price.formatter}
              parser={price.parser}
              min="0"
            />
          </Form.Item>
          <Form.Item label="Half Year Discount" name="halfYearDiscount">
            <InputNumber
              size="large"
              style={{ width: "200px" }}
              addonBefore={<PercentageOutlined />}
              formatter={discount.formatter}
              parser={discount.parser}
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
              formatter={price.formatter}
              parser={price.parser}
              min="0"
            />
          </Form.Item>
          <Form.Item label="Full Year Discount" name="fullYearDiscount">
            <InputNumber
              size="large"
              addonBefore={<PercentageOutlined />}
              style={{ width: "200px" }}
              formatter={discount.formatter}
              parser={discount.parser}
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
