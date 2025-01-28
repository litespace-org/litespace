import React, { useCallback, useMemo, useRef } from "react";
import { MediaType } from "@/components/Media/types";
import { Avatar } from "@litespace/luna/Avatar";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { VideoPlayer } from "@litespace/luna/VideoPlayer";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Upload, X } from "react-feather";
import cn from "classnames";

type Controls = {
  onDrop: () => void;
  onUpdate: (file: File) => void;
  disabled: boolean;
};

type Viewer = Controls & {
  media: string | File | null;
};

const useMediaUrl = (media: Viewer["media"]) => {
  return useMemo(() => {
    if (media instanceof File) return URL.createObjectURL(media);
    return media || null;
  }, [media]);
};

const Empty: React.FC<{ type: MediaType }> = ({ type }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-center w-full h-full">
      <p>
        {type === MediaType.Video
          ? intl("media.no.video")
          : intl("media.no.image")}
      </p>
    </div>
  );
};

const Controller: React.FC<Controls & { type: MediaType }> = ({
  onDrop,
  onUpdate,
  disabled,
  type,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const open = useCallback(() => {
    if (!ref.current) return;
    ref.current.click();
  }, []);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      return onUpdate(file);
    },
    [onUpdate]
  );

  const accept = useMemo(
    () => (type === MediaType.Video ? "video/mp4" : "image/png, image/jpeg"),
    [type]
  );

  return (
    <div className="flex flex-row items-center justify-center gap-2 mt-3 rounded-md">
      <input
        className="hidden"
        type="file"
        name="media"
        id="media"
        ref={ref}
        onChange={onChange}
        accept={accept}
      />
      <Button
        disabled={disabled}
        type={ButtonType.Main}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={onDrop}
      >
        <X className="w-6 h-6" />
      </Button>
      <Button
        disabled={disabled}
        type={ButtonType.Main}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={open}
      >
        <Upload className="w-6 h-6" />
      </Button>
    </div>
  );
};

const Video: React.FC<Viewer> = ({ media, onDrop, onUpdate, disabled }) => {
  const url = useMediaUrl(media);
  return (
    <div className="w-full aspect-[9/16]">
      {url ? <VideoPlayer src={url} /> : <Empty type={MediaType.Video} />}
      <Controller
        onDrop={onDrop}
        onUpdate={onUpdate}
        disabled={disabled}
        type={MediaType.Video}
      />
    </div>
  );
};

const Image: React.FC<Viewer> = ({ media, onDrop, onUpdate, disabled }) => {
  const url = useMediaUrl(media);
  return (
    <div className={cn("w-full", !media && "aspect-[9/16]")}>
      {url ? <Avatar src={url} /> : <Empty type={MediaType.Image} />}
      <Controller
        onDrop={onDrop}
        onUpdate={onUpdate}
        disabled={disabled}
        type={MediaType.Image}
      />
    </div>
  );
};

const Media: React.FC<
  Viewer & {
    type: MediaType;
    className?: string;
  }
> = ({ media, type, className, onDrop, onUpdate, disabled }) => {
  const Viewer = useMemo(
    () => (type === MediaType.Video ? Video : Image),
    [type]
  );

  return (
    <div
      className={cn(
        "h-fit bg-surface-300 border border-border-overlay rounded-md pb-3",
        className
      )}
    >
      <Viewer
        media={media}
        onDrop={onDrop}
        onUpdate={onUpdate}
        disabled={disabled}
      />
    </div>
  );
};

export default Media;
