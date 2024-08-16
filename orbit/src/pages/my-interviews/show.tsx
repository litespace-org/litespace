import { ICall, IInterview, IUser } from "@litespace/types";
import { Show, ShowButton, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Flex, Button } from "antd";
import dayjs from "@/lib/dayjs";
import { Resource } from "@/providers/data";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { ExportOutlined } from "@ant-design/icons";

const { Title } = Typography;

export const MyInterviewsShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<{
    call: ICall.Self;
    interview: IInterview.Self;
    interviewee: IUser.Self;
  }>({});

  const dataSource: TableRow[] = useMemo(() => {
    if (!data?.data) return [];
    const source = data.data;

    return [
      { name: "Interview ID", value: source.interview.ids.self },
      { name: "Interviewer ID", value: source.interview.ids.interviewer },
      { name: "Interviewee ID", value: source.interview.ids.interviewee },
      { name: "Call ID", value: source.interview.ids.call },
      {
        name: "Tutor Name",
        value: `${source.interviewee.name.en} (${source.interviewee.name.ar})`,
      },
      { name: "Tutor Email", value: source.interviewee.email },
      {
        name: "Interview At",
        value: source.call.start,
        type: "date",
      },
      {
        name: "Interview Join URL",
        value: `URL`,
        href: `http://localhost:5173/call/${source.call.id}`,
        type: "url",
      },
      {
        name: "Interviewer Feedback",
        value: source.interview.feedback.interviewer,
      },
      {
        name: "Interviewee Feedback",
        value: source.interview.feedback.interviewee,
      },
      {
        name: "Interviewer Note",
        value: source.interview.interviewerNote,
      },
      { name: "Interview Score", value: source.interview.score },
      {
        name: "Passed Interview",
        value:
          source.interview.passed === null
            ? "Not yet"
            : source.interview.passed === true
              ? "Yes"
              : "No",
      },
      {
        name: "Approved",
        value:
          source.interview.approved === null
            ? "Not yet"
            : source.interview.approved === true
              ? "Yes"
              : "No",
      },
      {
        name: "Approved By",
        value:
          source.interview.approvedBy === null
            ? "Not yet"
            : `# ${source.interview.approvedBy}`,
        href:
          source.interview.approvedBy !== null
            ? `/user/show/${source.interview.approvedBy}`
            : undefined,
        type: source.interview.approvedBy === null ? "text" : "url",
      },
    ];
  }, [data?.data]);

  return (
    <Show
      headerButtons={({ defaultButtons }) => {
        return (
          <>
            {defaultButtons}
            <Button icon={<ExportOutlined />} type="primary">
              Join Interview
            </Button>
          </>
        );
      }}
      canDelete={false}
      isLoading={isLoading}
    >
      <TableView dataSource={dataSource} />
    </Show>
  );
};
