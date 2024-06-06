import { ISlot } from "@litespace/types";
import { Edit, useForm } from "@refinedev/antd";
import { DatePicker, Flex, Form, Input, Select } from "antd";
import { weekdays, repeat } from "./create";
import dayjs, { Dayjs } from "dayjs";

export const MyScheduleEdit = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } =
    useForm<ISlot.Self>({});

  const slot = queryResult?.data?.data;

  console.log({ slot });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical" autoComplete="off">
        <Form.Item
          label={"Title"}
          name={"uTitle"}
          rules={[{ min: 5, message: "Title is too short" }]}
        >
          <Input placeholder={slot?.title} />
        </Form.Item>
        <Flex gap="40px">
          <Form.Item label="Date" name="uDate">
            <DatePicker.RangePicker
              placeholder={[
                dayjs(slot?.date.start).format("YYYY-MM-DD") || "Start date",
                slot?.date.end
                  ? dayjs(slot?.date.end).format("YYYY-MM-DD")
                  : "End date",
              ]}
              allowEmpty={[false, true]}
            />
          </Form.Item>
        </Flex>
        <Flex gap="40px">
          <Form.Item
            label="Start Time"
            name="uStartTime"
            rules={[
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
            name="uEndTime"
            rules={[
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
        <Form.Item label="Day of the week" name="weekday">
          <Select options={weekdays} placeholder={slot?.weekday} />
        </Form.Item>
        <Form.Item label="Repeat" name="uRepeat">
          <Select options={repeat} placeholder={slot?.repeat} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
