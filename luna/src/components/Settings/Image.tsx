import { asFullAssetUrl } from "@/lib/atlas";
import React, { useCallback, useRef } from "react";
import cn from "classnames";
import { Edit3 } from "react-feather";
import Spinner from "@/icons/Spinner";
import { RefreshUser, useFormatMessage, useUpdateProfileMedia } from "@/hooks";
import { Button, ButtonSize, ButtonType } from "@/components/Button";

const Image: React.FC<{
  image?: string | null;
  user?: number;
  refresh: RefreshUser;
  displayOnly?: boolean;
  className?: string;
}> = ({ image, user, displayOnly, refresh, className }) => {
  const ref = useRef<HTMLInputElement>(null);
  const intl = useFormatMessage();

  const open = useCallback(() => {
    if (!ref.current) return;
    ref.current.click();
  }, []);

  const mutation = useUpdateProfileMedia(refresh, user);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      return mutation.mutate({ image: file });
    },
    [mutation]
  );

  return (
    <div className="tw-relative">
      <div
        className={cn(
          "tw-relative",
          "tw-rounded-full tw-aspect-square tw-overflow-hidden",
          "tw-ring-4 tw-ring-background-selection tw-bg-background-selection",
          className
        )}
      >
        <div
          data-show={mutation.isPending}
          className={cn(
            "tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2",
            "tw-hidden data-[show=true]:tw-block"
          )}
        >
          <Spinner className="tw-text-foreground" />
        </div>
        <input
          accept="image/png, image/jpeg"
          onChange={onChange}
          className="tw-hidden"
          name="image"
          type="file"
          id="image"
          ref={ref}
        />
        <img
          className={cn("tw-inline-block tw-object-cover tw-w-full tw-h-full")}
          src={image ? asFullAssetUrl(image) : "/avatar-1.png"}
        />
      </div>
      <div className="tw-absolute tw-bottom-6 tw-right-4">
        <Button
          disabled={displayOnly}
          onClick={open}
          className="tw-flex-row"
          htmlType="button"
          type={ButtonType.Secondary}
          size={ButtonSize.Small}
        >
          <div className="tw-flex tw-flex-row tw-items-center tw-gap-1">
            <Edit3 className="tw-text-white/80 tw-w-5 tw-h-5" />
            <p>{intl("global.labels.edit")}</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Image;
