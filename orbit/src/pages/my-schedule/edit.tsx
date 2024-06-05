import { IUser } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";

export const MyScheduleEdit = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<IUser.Self>({});

  const { selectProps: userTypes } = useSelect({
    resource: "user_types",
    optionLabel: "label",
    optionValue: "value",
    meta: { for: "edit-user" },
  });

  const user = queryResult?.data?.data;

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
          <Input placeholder={user?.name || undefined} />
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
          <Input placeholder={user?.email} />
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
          <Input placeholder={user?.avatar || undefined} />
        </Form.Item>
        <Form.Item label="Birthday" name="uBithday">
          <DatePicker
            placeholder={
              user?.birthday
                ? dayjs(user.birthday).format("YYYY-MM-DD")
                : undefined
            }
          />
        </Form.Item>
        <Form.Item label={"Gender"} name={"uGender"}>
          <Select
            placeholder={user?.gender}
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
          <Select {...userTypes} placeholder={user?.type} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
