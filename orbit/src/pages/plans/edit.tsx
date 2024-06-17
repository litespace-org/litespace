import { IPlan, IUser } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
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
import { asDurationParts } from "@/lib/utils";

export const PlanEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading } = useOne<IPlan.Attributed>({
    resource: resource?.name,
    id,
  });

  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<IPlan.Attributed>({ meta: { plan: data?.data } });

  const plan = useMemo(
    () => queryResult?.data?.data,
    [queryResult?.data?.data]
  );

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
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
          <Form.Item label="Minutes" name="minutes" initialValue={minutes}>
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item
            label="Full Month Price"
            name="fullMonthPrice"
            initialValue={hours}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
          <Form.Item
            label="Full Month Discount"
            name="fullMonthDiscount"
            initialValue={minutes}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item
            label="Full Quarter Price"
            name="fullQuarterPrice"
            initialValue={hours}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
          <Form.Item
            label="Full Quarter Discount"
            name="fullQuarterDiscount"
            initialValue={minutes}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item
            label="Half Year Price"
            name="halfYearPrice"
            initialValue={hours}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
          <Form.Item
            label="Half Year Discount"
            name="halfYearDiscount"
            initialValue={minutes}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
        </Flex>

        <Flex gap="20px">
          <Form.Item
            label="Full Year Price"
            name="fullYearPrice"
            initialValue={hours}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
          </Form.Item>
          <Form.Item
            label="Full Year Discount"
            name="fullYearDiscount"
            initialValue={minutes}
          >
            <InputNumber size="large" style={{ width: "150px" }} />
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
