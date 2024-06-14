import TableView, { TableRow } from "@/components/TableView";
import { Resource } from "@/providers/data";
import { UserOutlined } from "@ant-design/icons";
import { ITutor, IUser } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useLink, useShow } from "@refinedev/core";
import { Button } from "antd";
import { useMemo } from "react";

export const TutorShow = () => {
  const Link = useLink();
  const {
    queryResult: { data, isLoading },
  } = useShow<ITutor.FullTutor>({});

  const tutor = useMemo(() => data?.data, [data?.data]);

  const dataSource: TableRow[] = useMemo(() => {
    if (!tutor) return [];

    return [
      { name: "ID", value: tutor.id },
      { name: "Name", value: tutor.name },
      { name: "Email", value: tutor.email },
      { name: "Has Password", value: tutor.hasPassword, type: "boolean" },
      { name: "Online", value: tutor.online, type: "boolean" },
      { name: "Gender", value: tutor.gender, type: "tag" },
      { name: "Type", value: tutor.type, type: "tag" },
      { name: "Bio", value: tutor.bio },
      { name: "About", value: tutor.about },
      { name: "Video", value: tutor.video, type: "url" },
      { name: "Avatar", value: tutor.avatar, type: "url" },
      {
        name: "Passed The Interview",
        value: tutor.passedInterview,
        type: "boolean",
      },
      {
        name: "Activated",
        value: tutor.activated,
        type: "boolean",
      },
      { name: "Created At", value: tutor.createdAt, type: "date" },
      { name: "Updated At", value: tutor.updatedAt, type: "date" },
    ];
  }, [tutor]);

  return (
    <Show
      headerButtons={({ defaultButtons }) => {
        return (
          <>
            {defaultButtons}

            <Link to={`/users/show/${tutor?.id}`}>
              <Button
                icon={<UserOutlined />}
                resource={Resource.Users}
                loading={isLoading}
              >
                View As A User
              </Button>
            </Link>
          </>
        );
      }}
      isLoading={isLoading}
      title="Tutor"
    >
      <TableView dataSource={dataSource} />
    </Show>
  );
};
