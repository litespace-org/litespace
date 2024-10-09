import {
  Button,
  ButtonSize,
  Card,
  toaster,
  useFormatMessage,
  atlas,
} from "@litespace/luna";
import { ITutor, IUser } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { AtSign, User } from "react-feather";
import Media from "@/components/Media/Media";
import { MediaType } from "@/components/Media/types";
import { useMutation } from "@tanstack/react-query";

const Tutor: React.FC<{
  tutor: ITutor.PublicTutorFieldsForMediaProvider;
  refresh: () => void;
}> = ({ tutor, refresh }) => {
  const [image, setImage] = useState<string | File | null>(tutor.image);
  const [video, setVideo] = useState<string | File | null>(tutor.video);

  const intl = useFormatMessage();
  const drop = useCallback(
    async (drop: IUser.UpdateApiPayload["drop"]) => {
      return await atlas.user.update(tutor.id, { drop });
    },
    [tutor.id]
  );

  const upload = useCallback(
    (payload: { photo?: File; video?: File }) => {
      return atlas.user.updateMedia(tutor.id, payload);
    },
    [tutor.id]
  );

  const update = useCallback(async () => {
    if (image === null || video === null)
      await drop({ image: image === null, video: video === null });

    if (image instanceof File || video instanceof File)
      await upload({
        photo: image instanceof File ? image : undefined,
        video: video instanceof File ? video : undefined,
      });
  }, [drop, image, upload, video]);

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl("media.update.success"),
    });
    refresh();
  }, [intl, refresh]);

  const onError = useCallback(
    (error: Error | null) => {
      toaster.success({
        title: intl("media.update.error"),
        description: error ? error.message : undefined,
      });
    },
    [intl]
  );

  const mutation = useMutation({
    mutationFn: update,
    mutationKey: ["update-tutor-media"],
    onSuccess,
    onError,
  });

  const confirm = useCallback(() => {
    return mutation.mutate();
  }, [mutation]);

  return (
    <Card className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        <li className="flex flex-row gap-2">
          <User />
          <p>{tutor.name}</p>
        </li>
        <li className="flex flex-row gap-2">
          <AtSign />
          <p>{tutor.email}</p>
        </li>
      </ul>

      <div className="grid grid-cols-12 gap-4">
        <Media
          media={video}
          type={MediaType.Video}
          className="col-span-12 md:col-span-6 lg:col-span-4"
          onDrop={() => setVideo(null)}
          onUpdate={(file: File) => setVideo(file)}
          disabled={mutation.isPending}
        />
        <Media
          media={image}
          type={MediaType.Image}
          className="col-span-12 md:col-span-6 lg:col-span-4"
          onDrop={() => setImage(null)}
          onUpdate={(file: File) => setImage(file)}
          disabled={mutation.isPending}
        />
      </div>

      <Button
        onClick={confirm}
        disabled={
          mutation.isPending || (tutor.image === image && tutor.video === video)
        }
        loading={mutation.isPending}
        size={ButtonSize.Small}
      >
        {intl("global.labels.confirm")}
      </Button>
    </Card>
  );
};

export default Tutor;
