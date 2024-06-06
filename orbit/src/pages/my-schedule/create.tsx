import { ISlot } from "@litespace/types";
import { Create, useForm } from "@refinedev/antd";
import { DatePicker, Flex, Form, Input, Select } from "antd";
import { Dayjs } from "dayjs";

export const weekdays = [
  { label: "None", value: -1 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
];

export const repeat = [
  { label: "No Rpeat", value: ISlot.Repeat.No },
  { label: "Daily", value: ISlot.Repeat.Daily },
  { label: "Weekly", value: ISlot.Repeat.Weekly },
  { label: "Montly", value: ISlot.Repeat.Monthly },
];

export const MyScheduleCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Create new availability slot"
    >
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item
          label={"Title"}
          name={["title"]}
          rules={[{ required: true, message: "Title is required" }, { min: 5 }]}
        >
          <Input />
        </Form.Item>
        <Flex gap="40px">
          <Form.Item
            label="date"
            name="date"
            rules={[
              {
                required: true,
                message: "This field is required",
              },
            ]}
          >
            <DatePicker.RangePicker allowEmpty={[false, true]} />
          </Form.Item>
        </Flex>
        <Flex gap="40px">
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[
              { required: true, message: "This field is required" },
              (formInstance) => ({
                message: "Invalid start time",
                validator(_, startTime: Dayjs | null) {
                  if (startTime === null) return Promise.resolve();
                  const endTime = formInstance.getFieldValue(
                    "endTime"
                  ) as Dayjs | null;

                  if (!endTime) return Promise.resolve();

                  if (startTime.isAfter(endTime) || startTime?.isSame(endTime))
                    return Promise.reject(new Error("Invalid start time"));

                  const error = formInstance.getFieldError("endTime");
                  if (error.length !== 0)
                    formInstance.validateFields(["endTime"]);

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker.TimePicker
              minuteStep={15}
              showSecond={false}
              needConfirm={false}
              use12Hours
            />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[
              { required: true, message: "This field is required" },
              (formInstance) => ({
                message: "Invalid end time",
                validator(_, endTime: Dayjs | null) {
                  if (endTime === null) return Promise.resolve();
                  const startTime = formInstance.getFieldValue(
                    "startTime"
                  ) as Dayjs | null;

                  if (!startTime) return Promise.resolve();

                  if (endTime.isBefore(startTime) || endTime.isSame(startTime))
                    return Promise.reject(new Error("Invalid end time"));

                  const error = formInstance.getFieldError("startTime");
                  if (error.length !== 0)
                    formInstance.validateFields(["startTime"]);

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker.TimePicker
              minuteStep={15}
              showSecond={false}
              needConfirm={false}
              use12Hours
            />
          </Form.Item>
        </Flex>
        <Form.Item label="Day of the week" name="weekday" initialValue={-1}>
          <Select options={weekdays} defaultValue={-1} />
        </Form.Item>
        <Form.Item label="Repeat" name="repeat" initialValue={ISlot.Repeat.No}>
          <Select options={repeat} defaultValue={ISlot.Repeat.No} />
        </Form.Item>
      </Form>
    </Create>
  );
};
