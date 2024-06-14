import { ITutor } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { useOne, useResource } from "@refinedev/core";
import { Form, Input, Switch } from "antd";

export const TutorEdit = () => {
  const { id, resource } = useResource();
  const { data, isLoading: tutorLoading } = useOne<ITutor.Self>({
    resource: resource?.name,
    id,
  });
  const { formProps, saveButtonProps, formLoading } = useForm<ITutor.FullTutor>(
    { meta: { tutor: data?.data } }
  );

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || tutorLoading}
    >
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item
          label="Name"
          name="name"
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
          <Input />
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
          <Input placeholder="https://example.com/photo.png" />
        </Form.Item>

        <Form.Item label="Bio" name="bio">
          <Input.TextArea rows={7} />
        </Form.Item>

        <Form.Item label="About" name="about">
          <Input.TextArea rows={7} />
        </Form.Item>

        <Form.Item
          label="Video URL"
          name="video"
          rules={[
            {
              pattern:
                /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
              message: "Invalid video url",
            },
          ]}
        >
          <Input placeholder="https://example.com/video.mp4" />
        </Form.Item>

        <Form.Item
          label="Passed Interview"
          name="passedInterview"
          layout="horizontal"
          labelCol={{ span: 2 }}
          labelAlign="left"
        >
          <Switch style={{ marginLeft: "10px" }} />
        </Form.Item>

        <Form.Item
          label="Tutor Activated"
          name="activated"
          layout="horizontal"
          labelCol={{ span: 2 }}
          labelAlign="left"
        >
          <Switch style={{ marginLeft: "10px" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
