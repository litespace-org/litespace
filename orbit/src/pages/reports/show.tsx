import { IReport, IReportReply } from "@litespace/types";
import { DeleteButton, Show, TagField } from "@refinedev/antd";
import {
  useCreate,
  useDelete,
  useList,
  useResource,
  useShow,
  useUpdate,
} from "@refinedev/core";
import { useCallback, useMemo, useState } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { Resource } from "@/providers/data";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Popover,
  Spin,
  Switch,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "@/lib/dayjs";
import {
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { required } from "@/lib/constants";

interface IReplyFormData {
  message: string;
  draft: boolean;
}

export const ReportShow = () => {
  const [editReplyId, setEditReplyId] = useState(0);
  const { id: resourceId } = useResource();
  const {
    queryResult: { data, isLoading: isCouponLoading },
  } = useShow<IReport.MappedAttributes>({});

  const { data: reportReply, isLoading: isLoadingReplies } =
    useList<IReportReply.MappedAttributes>({
      resource: Resource.ReportReplies,
      meta: { reportId: resourceId },
    });

  const { mutate: create, isLoading: isRepling } =
    useCreate<IReportReply.CreateApiPayload>({});

  const { mutate: updateReport, isLoading: isUpdatingReport } = useUpdate({});

  const { mutate: deleteReportReply, isLoading: isDeletingReportReply } =
    useDelete();

  const { mutate: toggleDraftState, isLoading: isUpdatingDraftState } =
    useUpdate({});

  const { mutate: updateReply, isLoading: isUpdatingReply } = useUpdate();

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
      create({
        resource: Resource.ReportReplies,
        values: { ...data, reportId: resourceId },
      });
    },
    [create, resourceId]
  );

  const toggleResolve = useCallback(() => {
    if (!report) return;
    return updateReport({
      resource: Resource.Reports,
      id: report.id,
      values: { resolved: !report.resolved },
      meta: { report },
    });
  }, [report, updateReport]);

  const onReplyDelete = useCallback(
    (replyId: number) => {
      return deleteReportReply({
        resource: Resource.ReportReplies,
        id: replyId,
      });
    },
    [deleteReportReply]
  );

  const onToggleDraftState = useCallback(
    async (replyId: number) => {
      const reply = reportReply?.data.find((reply) => reply.id === replyId);
      if (!reply) return;

      await toggleDraftState({
        resource: Resource.ReportReplies,
        id: replyId,
        values: { draft: !reply.draft },
        meta: { reply },
      });
    },
    [reportReply?.data, toggleDraftState]
  );

  const onUpdateReply = useCallback(
    async ({ message }: { message: string }) => {
      const reply = reportReply?.data.find((reply) => reply.id === editReplyId);
      if (!reply) return;
      await updateReply({
        resource: Resource.ReportReplies,
        id: editReplyId,
        values: { message },
        meta: { reply },
      });

      setEditReplyId(0);
    },
    [editReplyId, reportReply?.data, updateReply]
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
          <Timeline mode="alternate">
            {reportReply?.data.map((reply) => {
              const ownedByReporter =
                reply.createdBy.id === report?.createdBy.id;
              return (
                <Timeline.Item
                  label={
                    <>
                      <Typography.Text type="secondary">
                        Created at {dayjs(reply.createdAt).format("LLL")} <br />
                        Updated at {dayjs(reply.updatedAt).format("LLL")}
                      </Typography.Text>
                    </>
                  }
                  position={ownedByReporter ? "right" : "left"}
                >
                  {editReplyId === reply.id ? (
                    <Flex
                      style={{
                        flexDirection: "column",
                        marginBottom: "20px",
                      }}
                    >
                      <Card
                        style={{
                          width: "720px",
                          alignSelf: "start",
                        }}
                      >
                        <Form onFinish={onUpdateReply}>
                          <Form.Item
                            name="message"
                            initialValue={reply.message}
                          >
                            <Input.TextArea rows={7} />
                          </Form.Item>

                          <Button
                            loading={isUpdatingReply}
                            htmlType="submit"
                            type="primary"
                          >
                            Update
                          </Button>
                        </Form>
                      </Card>
                    </Flex>
                  ) : (
                    <Flex
                      style={{
                        flexDirection: "column",
                        marginBottom: "20px",
                      }}
                    >
                      <Card
                        hoverable
                        style={{
                          width: "720px",
                          alignSelf: ownedByReporter ? "end" : "start",
                        }}
                        actions={
                          ownedByReporter
                            ? []
                            : [
                                <Popover
                                  trigger="hover"
                                  title={
                                    reply.draft
                                      ? "Mark As Visible"
                                      : "Mark As Draft"
                                  }
                                  content={
                                    <Flex style={{ flexDirection: "column" }}>
                                      <Flex
                                        align="center"
                                        justify="center"
                                        gap="10px"
                                      >
                                        <Button
                                          type="primary"
                                          style={{ width: "100%" }}
                                          loading={isUpdatingDraftState}
                                          onClick={() =>
                                            onToggleDraftState(reply.id)
                                          }
                                        >
                                          Update
                                        </Button>
                                      </Flex>
                                    </Flex>
                                  }
                                >
                                  <AuditOutlined />,
                                </Popover>,
                                <Tooltip title="Edit Reply">
                                  <EditOutlined
                                    onClick={() => setEditReplyId(reply.id)}
                                  />
                                </Tooltip>,
                                <Popover
                                  trigger="hover"
                                  content={
                                    <Flex style={{ flexDirection: "column" }}>
                                      <Flex
                                        align="center"
                                        justify="center"
                                        gap="10px"
                                      >
                                        <Button
                                          style={{ width: "100%" }}
                                          loading={isDeletingReportReply}
                                          danger
                                          onClick={() =>
                                            onReplyDelete(reply.id)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </Flex>
                                    </Flex>
                                  }
                                  title="Delete Reply! Are you sure?"
                                >
                                  <DeleteOutlined />
                                </Popover>,
                              ]
                        }
                      >
                        <Flex>
                          <Typography.Paragraph>
                            {reply.message}
                          </Typography.Paragraph>
                        </Flex>

                        <Divider />

                        <Flex
                          align="flex-start"
                          style={{ flexDirection: "column" }}
                        >
                          <Typography.Text strong>
                            {reply.createdBy.name}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            {reply.createdBy.email}
                          </Typography.Text>

                          {!ownedByReporter && (
                            <Flex style={{ marginTop: "2px" }}>
                              <TagField
                                value={
                                  reply.draft
                                    ? "Draft (not visible)"
                                    : "Published"
                                }
                              />
                            </Flex>
                          )}
                        </Flex>
                      </Card>
                    </Flex>
                  )}
                </Timeline.Item>
              );
            })}
            <Timeline.Item position="left">
              <Form<IReplyFormData>
                onFinish={onReply}
                style={{ alignSelf: "end", width: "720px" }}
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
            </Timeline.Item>
          </Timeline>

          <Flex align="center" justify="center">
            <Button
              loading={isUpdatingReport}
              onClick={toggleResolve}
              danger={report?.resolved}
              size="large"
            >
              {report?.resolved
                ? "Mark report as unresolved yet"
                : "Mark as resolved"}
            </Button>
          </Flex>
        </Flex>
      ) : null}
    </Show>
  );
};
