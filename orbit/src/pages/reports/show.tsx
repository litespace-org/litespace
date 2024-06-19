import { IReport, IReportReply } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useCreate, useList, useResource, useShow } from "@refinedev/core";
import { useCallback, useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { Resource } from "@/providers/data";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Spin,
  Switch,
  Typography,
} from "antd";
import dayjs from "@/lib/dayjs";
import { SendOutlined } from "@ant-design/icons";
import { required } from "@/lib/constants";

interface IReplyFormData {
  message: string;
  draft: boolean;
}

export const ReportShow = () => {
  const { id: resourceId } = useResource();
  const {
    queryResult: { data, isLoading: isCouponLoading },
  } = useShow<IReport.MappedAttributes>({});

  const { data: reportReply, isLoading: isLoadingReplies } =
    useList<IReportReply.MappedAttributes>({
      resource: Resource.ReportReplies,
      meta: { reportId: resourceId },
    });

  const { mutate, isLoading: isRepling } =
    useCreate<IReportReply.CreateApiPayload>({});

  const report = useMemo(() => data?.data, [data?.data]);

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!report) return [];
    return [
      { name: "ID", value: report.id },
      {
        name: "Reported By",
        value: report.createdBy.email,
        type: "url",
        href: `/users/show/${report.createdBy.id}`,
      },
      { name: "Title", value: report.title },
      { name: "Description", value: report.description },
      { name: "Category", value: report.category },
      {
        name: "Resovled",
        value: report.resolved,
        type: "boolean",
        helper: report.resolved ? "Resolved" : "Not resolved yet",
      },
      { name: "Resovled At", value: report.resolvedAt, type: "date" },
      { name: "Updated At", value: report.updatedAt, type: "date" },
      {
        name: "Updated By",
        value: report.updatedBy.email,
        type: "url",
        href: `/users/show/${report.updatedBy.id}`,
      },
    ];
  }, [report]);

  const onReply = useCallback(
    (data: IReplyFormData) => {
      mutate({
        resource: Resource.ReportReplies,
        values: { ...data, reportId: resourceId },
      });
    },
    [mutate, resourceId]
  );

  return (
    <Show isLoading={isCouponLoading} title="Report">
      <TableView dataSource={dataSoruce} />

      <Divider>Replies</Divider>

      {isLoadingReplies ? (
        <Flex align="center" justify="center" style={{ height: "250px" }}>
          <Spin />
        </Flex>
      ) : reportReply?.data ? (
        <Flex style={{ flexDirection: "column" }}>
          <Flex>
            {reportReply?.data.map((reply) => (
              <Card hoverable style={{ width: "50%" }}>
                <Typography.Paragraph>{reply.message}</Typography.Paragraph>

                <Divider />

                <Flex style={{ flexDirection: "column" }}>
                  <Typography.Text strong>
                    {reply.createdBy.name}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {reply.createdBy.email}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Created at {dayjs(reply.createdAt).format("LLL")}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Updated at {dayjs(reply.updatedAt).format("LLL")}
                  </Typography.Text>
                </Flex>
              </Card>
            ))}
          </Flex>

          <Form<IReplyFormData>
            onFinish={onReply}
            style={{ alignSelf: "end", width: "50%", marginTop: "20px" }}
          >
            <Form.Item name="message" rules={[required]}>
              <Input.TextArea rows={7} />
            </Form.Item>
            <Flex justify="space-between" style={{ width: "100%" }}>
              <Form.Item label="Draft" name="draft" initialValue={true}>
                <Switch />
              </Form.Item>

              <Button
                loading={isRepling}
                icon={<SendOutlined />}
                type="primary"
                htmlType="submit"
              >
                Send
              </Button>
            </Flex>
          </Form>
        </Flex>
      ) : null}
    </Show>
  );
};
