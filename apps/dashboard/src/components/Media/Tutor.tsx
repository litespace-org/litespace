import {
  Button,
} from "@litespace/ui/Button";
import { Card } from "@litespace/ui/Card";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ITutor, IUser } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { AtSign, User } from "react-feather";
import Media from "@/components/Media/Media";
import { MediaType } from "@/components/Media/types";
import { useMutation } from "@tanstack/react-query";
import { useAtlas } from "@litespace/headless/atlas";

const Tutor: React.FC<{
  tutor: ITutor.PublicTutorFieldsForStudio;
  refresh: () => void;
}> = ({ tutor, refresh }) => {
  const [image, setImage] = useState<string | File | null>(tutor.image);
  const [video, setVideo] = useState<string | File | null>(tutor.video);
  const toast = useToast();
  const atlas = useAtlas();

  const intl = useFormatMessage();
  const drop = useCallback(
    async (drop: IUser.UpdateApiPayload["drop"]) => {
      return await atlas.user.update(tutor.id, { drop });
    },
    [atlas.user, tutor.id]
  );

  const upload = useCallback(
    ({ image, video }: { image?: File; video?: File }) => {
      const payload: IUser.UpdateMediaPayload | null =
        image && video
          ? { image, video }
          : image
            ? { image }
            : video
              ? { video }
              : null;

      if (!payload) return;
      return atlas.user.updateMedia(tutor.id, payload);
    },
    [tutor.id, atlas.user]
  );

  const update = useCallback(async () => {
    const dropImage = image === null && image !== tutor.image;
    const dropVideo = video === null && video !== tutor.video;
    if (dropImage || dropVideo)
      await drop({ image: image === null, video: video === null });

    if (image instanceof File || video instanceof File)
      await upload({
        image: image instanceof File ? image : undefined,
        video: video instanceof File ? video : undefined,
      });
  }, [drop, image, tutor.image, tutor.video, upload, video]);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("media.update.success") });
    refresh();
  }, [intl, refresh, toast]);

  const onError = useCallback(
    (error: Error | null) => {
      toast.success({
        title: intl("media.update.error"),
        description: error ? error.message : undefined,
      });
    },
    [intl, toast]
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

  const reset = useCallback(() => {
    setImage(tutor.image);
    setVideo(tutor.video);
  }, [tutor.image, tutor.video]);

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

      <div className="flex flex-row gap-2">
        <Button
          onClick={confirm}
          disabled={
            mutation.isPending ||
            (tutor.image === image && tutor.video === video)
          }
          loading={mutation.isPending}
          size={"small"}
        >
          {intl("labels.confirm")}
        </Button>
        <Button
          onClick={reset}
          disabled={
            mutation.isPending ||
            (tutor.image === image && tutor.video === video)
          }
          loading={mutation.isPending}
          size={"small"}
          type={"main"}
          variant={"secondary"}
        >
          {intl("global.labels.cancel")}
        </Button>
      </div>
    </Card>
  );
};

export default Tutor;
