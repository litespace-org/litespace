import TableView, { TableRow } from "@/components/TableView";
import { ITutor } from "@litespace/types";
import { ImageField, Show } from "@refinedev/antd";
import { useLink, useShow } from "@refinedev/core";
import { Alert, Flex, Table, Typography } from "antd";
import { useMemo } from "react";
import { asUrl } from "@litespace/atlas";
import { backend } from "@/lib/atlas";

export const TutorMediaShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ITutor.TutorMedia>({});

  const tutor = useMemo(() => data?.data, [data?.data]);

  const dataSource = useMemo((): TableRow[] => {
    if (!tutor) return [];
    return [
      { name: "ID", value: tutor.id },
      { name: "Name", value: tutor.name },
      { name: "Email", value: tutor.email },
      {
        name: "Photo",
        value: tutor.photo ? (
          <ImageField
            value={asUrl(backend, tutor.photo)}
            title={tutor?.name || undefined}
          />
        ) : (
          <Alert
            message="Tutor has no profile image yet"
            type="warning"
            showIcon
          />
        ),
      },
      {
        name: "Video",
        value: tutor.video ? (
          <Flex>
            <video
              controls
              style={{ display: "inline-block", width: "100%", height: "100%" }}
              src={asUrl(backend, tutor.video)}
            />
          </Flex>
        ) : (
          <Alert
            message="Tutor has no profile video yet"
            type="warning"
            showIcon
          />
        ),
      },
    ];
  }, [tutor]);

  return (
    <Show canDelete={false} isLoading={isLoading} title="Tutor">
      <TableView dataSource={dataSource} />
    </Show>
  );
};
