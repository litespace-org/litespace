import TableView, { TableRow } from "@/components/TableView";
import { ITutor } from "@litespace/types";
import { ImageField, Show } from "@refinedev/antd";
import { useLink, useShow } from "@refinedev/core";
import { Alert, Flex, Typography } from "antd";
import { useMemo } from "react";
import { asUrl } from "@litespace/atlas";
import { backend } from "@/lib/atlas";

export const TutorMediaShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ITutor.TutorMedia>({});

  const tutor = useMemo(() => data?.data, [data?.data]);

  return (
    <Show canDelete={false} isLoading={isLoading} title="Tutor">
      <Flex style={{ flexDirection: "column", marginBottom: "20px" }}>
        <Typography.Title level={2}>Photo</Typography.Title>
        {tutor?.photo ? (
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
        )}
      </Flex>

      <Flex style={{ flexDirection: "column", marginBottom: "20px" }}>
        <Typography.Title level={2}>Video</Typography.Title>
        {tutor?.video ? (
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
        )}
      </Flex>
    </Show>
  );
};
