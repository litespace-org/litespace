import { backend, backendUrl } from "@/lib/atlas";
import { Resource } from "@/providers/data";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { asUrl } from "@litespace/atlas";
import { ITutor } from "@litespace/types";
import { Edit, ImageField } from "@refinedev/antd";
import {
  useNotification,
  useOne,
  useResourceParams,
  useUpdate,
} from "@refinedev/core";
import {
  Button,
  Divider,
  Flex,
  Space,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import { useCallback, useMemo, useState } from "react";

export const TutorMediaEdit = () => {
  const { id, resource } = useResourceParams();
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const { data, isLoading } = useOne<ITutor.TutorMedia>({
    resource: resource?.name,
    id,
  });

  const media = useMemo(() => data?.data, [data?.data]);

  const photoProps: UploadProps = useMemo(
    () => ({
      accept: "image/png, image/jpeg",
      onRemove: () => {
        setPhoto(null);
      },
      beforeUpload: (file) => {
        setPhoto(file);
        return false;
      },
    }),
    []
  );

  const videoProps: UploadProps = useMemo(
    () => ({
      accept: "video/mp4, video/webm",
      onRemove: () => {
        setVideo(null);
      },
      beforeUpload: (file) => {
        setVideo(file);
        return false;
      },
    }),
    []
  );

  const photoUrl = useMemo(() => {
    if (photo) return URL.createObjectURL(photo);
    if (media?.photo) return asUrl(backend, media.photo);
    return undefined;
  }, [media?.photo, photo]);

  const videoUrl = useMemo(() => {
    if (video) return URL.createObjectURL(video);
    if (media?.video) return asUrl(backend, media.video);
    return undefined;
  }, [media?.video, video]);

  const { mutateAsync, isLoading: isUpdating } = useUpdate();

  const onSave = useCallback(async () => {
    if (!photo && !video) return;
    if (!id) return;

    await mutateAsync({
      resource: Resource.TutorsMedia,
      values: { photo, video },
      id,
    });

    setPhoto(null);
    setVideo(null);
  }, [id, mutateAsync, photo, video]);

  return (
    <Edit
      saveButtonProps={{
        onClick: onSave,
        disabled: !photo && !video,
        loading: isUpdating,
      }}
      title="Edit tutor media"
      isLoading={isLoading}
      canDelete={false}
    >
      <Space style={{ display: "block" }}>
        <Typography.Title level={3}>Photo</Typography.Title>
        <Flex>
          <ImageField value={photoUrl} />
        </Flex>

        <Space style={{ marginTop: "20px" }}>
          <Upload {...photoProps}>
            <Button icon={<UploadOutlined />}>Update photo</Button>
          </Upload>
        </Space>
      </Space>

      <Divider />

      <Space style={{ display: "block" }}>
        <Typography.Title level={3}>Video</Typography.Title>
        <Flex>
          <video
            style={{ display: "inline-block", width: "100%" }}
            src={videoUrl}
            controls
          />
        </Flex>

        <Space style={{ marginTop: "20px" }}>
          <Upload {...videoProps}>
            <Button icon={<UploadOutlined />}>Update video</Button>
          </Upload>
        </Space>
      </Space>
    </Edit>
  );
};
