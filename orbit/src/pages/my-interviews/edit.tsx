import { Resource } from "@/providers/data";
import { IInterview, IUser } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { useGetIdentity, useOne, useResourceParams } from "@refinedev/core";
import { Form, Input, Rate, Switch } from "antd";

export const MyInterviewsEdit = () => {
  const { data: userData, isLoading } = useGetIdentity<IUser.Self>();
  const { id } = useResourceParams();
  const { data, isLoading: isLoadingInterview } = useOne<IInterview.Self>({
    resource: Resource.MyInterviews,
    meta: { interviewOnly: true },
    id,
  });
  const { formProps, saveButtonProps, formLoading } = useForm<IInterview.Self>({
    meta: {
      interviewOnly: true,
      interview: data?.data,
      currentUserId: userData?.id,
    },
  });

  return (
    <Edit
      title="Edit interview"
      saveButtonProps={saveButtonProps}
      canDelete={false}
      isLoading={formLoading || isLoadingInterview || isLoading}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item
          name={["feedback", "interviewer"]}
          label="Interviewer Feedback (Public)"
        >
          <Input.TextArea dir="rtl" rows={13} />
        </Form.Item>
        <Form.Item name="interviewerNote" label="Interviewer Note (Private)">
          <Input.TextArea dir="rtl" rows={13} />
        </Form.Item>

        <Form.Item name="score" label="Tutuor Rating" layout="horizontal">
          <Rate />
        </Form.Item>
        <Form.Item name="passed" label="Passed Interview" layout="horizontal">
          <Switch />
        </Form.Item>
        {userData &&
          [IUser.Role.SuperAdmin, IUser.Role.RegularAdmin].includes(
            userData.role
          ) && (
            <Form.Item name="approved" label="Approved" layout="horizontal">
              <Switch />
            </Form.Item>
          )}
      </Form>
    </Edit>
  );
};
