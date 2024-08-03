import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { required } from "@/lib/constants";
import { categoryOptions } from "@litespace/luna";

export const ReportCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item label="Title" name="title" rules={[required]}>
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[required, { max: 1000, message: "Description is two long" }]}
        >
          <Input.TextArea size="large" rows={10} />
        </Form.Item>

        <Form.Item label="Category" name="category" rules={[required]}>
          <Select
            placeholder="Select a category"
            style={{ width: "420px" }}
            options={categoryOptions}
            size="large"
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
