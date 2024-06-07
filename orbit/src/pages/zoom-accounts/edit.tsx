import { IZoomAccount } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const ZoomAccountEdit = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<IZoomAccount.Self>({});

  const zoomAccount = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item label="Account ID" name="uAccountId">
          <Input placeholder={zoomAccount?.accountId} />
        </Form.Item>

        <Form.Item label="Client ID" name="uClientId">
          <Input placeholder={zoomAccount?.clientId} />
        </Form.Item>

        <Form.Item label="Client Secret" name="uClientSecret">
          <Input placeholder={zoomAccount?.clientSecret} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
