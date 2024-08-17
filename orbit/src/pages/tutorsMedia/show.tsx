import TableView, { TableRow } from "@/components/TableView";
import { ITutor } from "@litespace/types";
import { ImageField, Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Alert, Flex } from "antd";
import { useMemo } from "react";
import { asAssetUrl } from "@litespace/atlas";
import { backend } from "@/lib/atlas";

export const TutorMediaShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ITutor.TutorMedia>({});

  const tutor = useMemo(() => data?.data, [data?.data]);

  const dataSource = useMemo((): TableRow[] => {
    if (!tutor) return [];
    console.log(tutor);
    return [
      { name: "ID", value: tutor.id },
      { name: "Name (EN)", value: tutor.name.en || "-" },
      { name: "Name (AR)", value: tutor.name.ar || "-" },
      { name: "Email", value: tutor.email },
      {
        name: "Photo",
        value: tutor.photo ? (
          <ImageField
            style={{ maxHeight: "900px", maxWidth: "100%" }}
            value={asAssetUrl(backend, tutor.photo)}
            title={tutor.name.en || tutor.name.ar || "Tutor" || undefined}
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
              style={{
                display: "inline-block",
                maxHeight: "900px",
                maxWidth: "100%",
              }}
              src={asAssetUrl(backend, tutor.video)}
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
