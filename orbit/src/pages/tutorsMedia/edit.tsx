import { backend } from "@/lib/atlas";
import { Resource } from "@/providers/data";
import {
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { asAssetUrl } from "@litespace/atlas";
import { ITutor } from "@litespace/types";
import { Edit, ImageField } from "@refinedev/antd";
import { useOne, useResourceParams, useUpdate } from "@refinedev/core";
import {
  Alert,
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
  const [dropPhoto, setDropPhoto] = useState<boolean>(false);
  const [dropVideo, setDropVideo] = useState<boolean>(false);

  const { data, isLoading } = useOne<ITutor.TutorMedia>({
    resource: resource?.name,
    id,
  });

  const media = useMemo(() => data?.data, [data?.data]);

  const photoProps: UploadProps = useMemo(
    () => ({
      accept: "image/png, image/jpeg",
      onRemove: () => {
        setDropPhoto(false);
        setPhoto(null);
      },
      beforeUpload: (file) => {
        setDropPhoto(false);
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
        setDropVideo(false);
        setVideo(null);
      },
      beforeUpload: (file) => {
        setDropVideo(false);
        setVideo(file);
        return false;
      },
    }),
    []
  );

  const photoUrl = useMemo(() => {
    if (dropPhoto) return undefined;
    if (photo) return URL.createObjectURL(photo);
    if (media?.photo) return asAssetUrl(backend, media.photo);
    return undefined;
  }, [dropPhoto, media?.photo, photo]);

  const videoUrl = useMemo(() => {
    if (dropVideo) return undefined;
    if (video) return URL.createObjectURL(video);
    if (media?.video) return asAssetUrl(backend, media.video);
    return undefined;
  }, [media?.video, video, dropVideo]);

  const { mutateAsync: updateTutorMedia, isLoading: isUpdating } = useUpdate();
  const { mutateAsync: dropTutorMedia, isLoading: isDropping } = useUpdate();

  const onUpdateMedia = useCallback(async () => {
    if (!photo && !video) return;
    if (!id) return;
    await updateTutorMedia({
      resource: Resource.TutorsMedia,
      values: { photo, video },
      id,
    });
  }, [id, photo, updateTutorMedia, video]);

  const onDropMedia = useCallback(() => {
    if (!dropVideo && !dropPhoto) return;
    if (!id) return;
    dropTutorMedia({
      resource: Resource.TutorsMedia,
      values: { dropPhoto, dropVideo },
      meta: { drop: true },
      id,
    });
  }, [dropPhoto, dropTutorMedia, dropVideo, id]);

  const reset = useCallback(() => {
    setPhoto(null);
    setVideo(null);
    setDropPhoto(false);
    setDropVideo(false);
  }, []);

  const onSave = useCallback(async () => {
    await onUpdateMedia();
    await onDropMedia();
    reset();
  }, [onDropMedia, onUpdateMedia, reset]);

  const disabled = useMemo(() => {
    const uploading = photo || video;
    const dropping = dropPhoto || dropVideo;
    return !uploading && !dropping;
  }, [dropPhoto, dropVideo, photo, video]);

  return (
    <Edit
      saveButtonProps={{
        onClick: onSave,
        disabled: disabled,
        loading: isUpdating,
      }}
      title="Edit tutor media"
      isLoading={isLoading}
      canDelete={false}
      footerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button onClick={reset} type="dashed" icon={<ReloadOutlined />}>
            Reset
          </Button>
        </>
      )}
    >
      <Space style={{ display: "block" }}>
        <Typography.Title level={3}>Photo</Typography.Title>
        {photoUrl ? (
          <Flex style={{ maxWidth: "1500px" }}>
            <ImageField value={photoUrl} />
          </Flex>
        ) : (
          <Flex style={{ width: "100%" }}>
            <Alert
              message="Tutor has no profile image yet"
              type="warning"
              showIcon
              style={{ width: "50%" }}
            />
          </Flex>
        )}

        <Flex style={{ marginTop: "20px", alignItems: "start", gap: "12px" }}>
          <Upload {...photoProps}>
            <Button icon={<UploadOutlined />}>Update photo</Button>
          </Upload>

          <Button
            onClick={() => setDropPhoto(true)}
            icon={<DeleteOutlined />}
            loading={isDropping}
            disabled={!photoUrl || !media || !media.photo}
            danger
          >
            Remove photo
          </Button>
        </Flex>

        <Typography.Text
          italic
          underline
          style={{ marginTop: "8px", display: "inline-block" }}
        >
          Don't forget to click save when uploading/deleting images
        </Typography.Text>
      </Space>

      <Divider />

      <Space style={{ display: "block" }}>
        <Typography.Title level={3}>Video</Typography.Title>
        <Flex>
          {videoUrl ? (
            <video
              style={{
                display: "inline-block",
                width: "100%",
                maxWidth: "1500px",
              }}
              src={videoUrl}
              controls
            />
          ) : (
            <Flex style={{ width: "100%" }}>
              <Alert
                message="Tutor has no profile video yet"
                type="warning"
                showIcon
                style={{ width: "50%" }}
              />
            </Flex>
          )}
        </Flex>

        <Flex style={{ marginTop: "20px", gap: "12px", alignItems: "start" }}>
          <Upload {...videoProps}>
            <Button icon={<UploadOutlined />}>Update video</Button>
          </Upload>

          <Button
            onClick={() => setDropVideo(true)}
            icon={<DeleteOutlined />}
            loading={isDropping}
            disabled={!videoUrl || !media || !media.video}
            danger
          >
            Remove Video
          </Button>
        </Flex>
        <Typography.Text
          italic
          underline
          style={{ marginTop: "8px", display: "inline-block" }}
        >
          Don't forget to click save when uploading/deleting videos
        </Typography.Text>
      </Space>
    </Edit>
  );
};
