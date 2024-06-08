import { Resource } from "@/providers/data";
import { ITutor, IUser } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, Select, Switch } from "antd";
import dayjs from "dayjs";

export const TutorEdit = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<ITutor.FullTutor>({});

  const tutor = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form
        {...formProps}
        layout="vertical"
        labelCol={{ span: 3 }}
        // wrapperCol={{ span: 20 }}
        autoComplete="off"
      >
        <Form.Item
          label="Public Feedback"
          name="uPublicFeedback"
          rules={[{ min: 50 }]}
        >
          <Input.TextArea
            dir="rtl"
            rows={10}
            placeholder={tutor?.publicFeedback || undefined}
          />
        </Form.Item>
        <Form.Item label="Private Feedback" name="uPrivateFeedback">
          <Input.TextArea
            dir="rtl"
            rows={10}
            placeholder={tutor?.privateFeedback || undefined}
          />
        </Form.Item>
        <Form.Item label="Interview URL" name="uInterviewUrl">
          <Input placeholder={tutor?.interviewUrl || undefined} />
        </Form.Item>
        <Form.Item
          label="Passed Interview"
          name="uPassedInterview"
          initialValue={tutor?.passedInterview}
          layout="horizontal"
          labelCol={{ span: 2 }}
          labelAlign="left"
        >
          <Switch style={{ marginLeft: "10px" }} />
        </Form.Item>

        <Form.Item
          label="Tutor Activated"
          name="uActivate"
          initialValue={tutor?.activated}
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
