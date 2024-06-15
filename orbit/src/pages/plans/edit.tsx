import { IUser } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { genders, userTypes } from "@/lib/constants";
import { useOne, useResource } from "@refinedev/core";
import { Resource } from "@/providers/data";

export const PlanEdit = () => {
  const { resource, id } = useResource();
  const { data, isLoading } = useOne<IUser.Self>({
    resource: resource?.name,
    id,
  });

  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<IUser.Self>({
      meta: { user: data?.data },
    });

  const user = queryResult?.data?.data;

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || isLoading}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { min: 3 },
            { max: 50 },
            { pattern: /^[\u0600-\u06FF\s]+$/, message: "Invalid arabic name" },
          ]}
          initialValue={user?.name}
        >
          <Input placeholder={user?.name || undefined} />
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
          initialValue={user?.email}
        >
          <Input autoComplete="username" />
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
          <Input type="password" autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          label="Avatar"
          name="avatar"
          rules={[
            {
              pattern:
                /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
              message: "Invalid avatar url",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Birthday"
          name="userBirthday"
          initialValue={user?.birthday ? dayjs(user.birthday) : undefined}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item label="Gender" name="gender">
          <Select options={genders} />
        </Form.Item>
        <Form.Item label="User Type" name="type">
          <Select options={userTypes} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
