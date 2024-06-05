import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const UserCreate = () => {
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
          label={"Name"}
          name={["name"]}
          rules={[
            { min: 3 },
            { max: 50 },
            { pattern: /^[\u0600-\u06FF\s]+$/, message: "Invalid arabic name" },
          ]}
        >
          <Input />
        </Form.Item>
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
          label="Password"
          name="password"
          rules={[
            {
              pattern:
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
              message: "Invalid password",
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          label={"Type"}
          name={["type"]}
          rules={[{ required: true, message: "User type is required" }]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
      </Form>
    </Create>
  );
};
