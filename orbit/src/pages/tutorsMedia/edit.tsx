import { ITutor } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { useOne, useResource } from "@refinedev/core";
import { Form, Input, Select, Switch } from "antd";
import { genders } from "@/lib/constants";

export const TutorMediaEdit = () => {
  const { id, resource } = useResource();

  const { data, isLoading: tutorLoading } = useOne<ITutor.TutorMedia>({
    resource: resource?.name,
    id,
  });

  const { formProps, saveButtonProps, formLoading } = useForm<ITutor.FullTutor>(
    { meta: { tutor: data?.data } }
  );

  return (
    <Edit
      title="Edit tutor media"
      saveButtonProps={saveButtonProps}
      isLoading={formLoading || tutorLoading}
      canDelete={false}
    >
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item label="Photo" name="photo">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
