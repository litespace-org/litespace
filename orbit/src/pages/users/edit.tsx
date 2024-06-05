import { IUser } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";

export const UserEdit = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});

  const { selectProps: userTypes } = useSelect({
    resource: "user_types",
    optionLabel: "label",
    optionValue: "value",
    meta: { for: "edit-user" },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name"}
          name={"uName"}
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
          name="uEmail"
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
          name="uPassword"
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
          label="Avatar"
          name="uAvatar"
          rules={[
            {
              pattern:
                /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
              message: "Invalid avtar url",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Birthday" name="uBithday">
          <DatePicker />
        </Form.Item>
        <Form.Item label={"Gender"} name={"uGender"}>
          <Select
            options={[
              { value: IUser.Gender.Male, label: "Male" },
              { value: IUser.Gender.Female, label: "Female" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={"User Type"}
          name={"uType"}
          initialValue={formProps?.initialValues?.category?.id}
        >
          <Select {...userTypes} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
