import { ICoupon } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { Flex, Form, Input, InputNumber, Select, Switch } from "antd";
import { useOne, useResource } from "@refinedev/core";
import { PercentageOutlined } from "@ant-design/icons";
import { discountFormatter, discountParser } from "@/lib/utils";
import { categoryOptions } from "@litespace/luna";

export const ReportEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading: isCouponLoading } = useOne<ICoupon.MappedAttributes>(
    { resource: resource?.name, id }
  );

  const { formProps, saveButtonProps, formLoading } =
    useForm<ICoupon.MappedAttributes>({
      meta: { report: data?.data },
    });

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || isCouponLoading}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item label="Title" name="title">
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ max: 1000, message: "Description is two long" }]}
        >
          <Input.TextArea size="large" rows={10} />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select
            placeholder="Select a category"
            style={{ width: "420px" }}
            options={categoryOptions}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Resolved" name="resolved" layout="horizontal">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
