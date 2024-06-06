import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const ZoomAccountCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "user_types",
    optionLabel: "label",
    optionValue: "value",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              pattern: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
              message: "Invalid email",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Account ID"
          name="accountId"
          rules={[{ required: true, message: "This field is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Client ID"
          name="clientId"
          rules={[{ required: true, message: "This field is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Client Secret"
          name="clientSecret"
          rules={[{ required: true, message: "This field is required" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
