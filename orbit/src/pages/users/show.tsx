import { IUser } from "@litespace/types";
import { ExportButton, Show, ShowButton } from "@refinedev/antd";
import { useLink, useShow } from "@refinedev/core";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";
import { Button } from "antd";
import { Resource } from "@/providers/data";
import { UserOutlined } from "@ant-design/icons";

export const UserShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<IUser.Self>({});
  const Link = useLink();

  const user = useMemo(() => data?.data, [data?.data]);

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!user) return [];
    return [
      { name: "ID", value: user.id },
      { name: "Name", value: user.name },
      { name: "Email", value: user.email },
      { name: "Has Password", value: user.hasPassword, type: "boolean" },
      { name: "Online", value: user.online, type: "boolean" },
      { name: "Gender", value: user.gender, type: "tag" },
      { name: "Type", value: user.type, type: "tag" },
      { name: "Created At", value: user.createdAt, type: "date" },
      { name: "Updated At", value: user.updatedAt, type: "date" },
    ];
  }, [user]);

  return (
    <Show
      headerButtons={({ defaultButtons }) => {
        return (
          <>
            {defaultButtons}
            {user?.type === IUser.Type.Tutor ? (
              <Link to={`/tutors/show/${user.id}`}>
                <Button
                  icon={<UserOutlined />}
                  resource={Resource.Tutors}
                  loading={isLoading}
                >
                  View As A Tutor
                </Button>
              </Link>
            ) : null}
          </>
        );
      }}
      isLoading={isLoading}
      title="User"
    >
      <TableView dataSource={dataSoruce} />
    </Show>
  );
};
