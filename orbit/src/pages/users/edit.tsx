import { IUser } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { userTypes } from "@/lib/constants";
import { useOne, useResource } from "@refinedev/core";
import { Resource } from "@/providers/data";

export const UserEdit = () => {
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
          label="Avatar"
          name="avatar"
          rules={[
            {
              pattern:
                /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
              message: "Invalid avtar url",
            },
          ]}
          initialValue={user?.avatar}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Birthday"
          name="bithday"
          initialValue={
            user?.birthday
              ? dayjs(user.birthday).format("YYYY-MM-DD")
              : undefined
          }
        >
          <DatePicker />
        </Form.Item>
        <Form.Item label="Gender" name="gender" initialValue={user?.gender}>
          <Select
            options={[
              { value: IUser.Gender.Male, label: "Male" },
              { value: IUser.Gender.Female, label: "Female" },
            ]}
          />
        </Form.Item>
        <Form.Item label="User Type" name="type" initialValue={user?.type}>
          <Select options={userTypes} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
