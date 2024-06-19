import { Create, useForm, useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import { required } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { Resource } from "@/providers/data";
import { IPlan } from "@litespace/types";

export const InviteCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps } = useSelect<IPlan.MappedAttributes>({
    resource: Resource.Plans,
    optionLabel: ((item: IPlan.MappedAttributes) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `#${item.id} ${item.alias} - ${formatDuration(item.weeklyMinutes)}`) as any,
    optionValue: "id",
    searchField: "alias",
    sorters: [{ field: "id", order: "asc" }],
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            required,
            {
              pattern: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
              message: "Invalid email",
            },
          ]}
        >
          <Input size="large" autoComplete="username" />
        </Form.Item>

        <Form.Item label="Target Plan" name="planId" rules={[required]}>
          <Select
            placeholder="Select a plan"
            style={{ width: "420px" }}
            {...selectProps}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Expires At" name="expiresAt" rules={[required]}>
          <DatePicker size="large" style={{ width: "420px" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
