import { IUser, IZoomAccount } from "@litespace/types";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";

export const ZoomAccountEdit = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<IZoomAccount.Self>({});

  const zoomAccount = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
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
          <Input placeholder={zoomAccount?.email} />
        </Form.Item>

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
