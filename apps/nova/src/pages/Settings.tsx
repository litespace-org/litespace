import PageTitle from "@/components/Common/PageTitle";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors, setUserProfile } from "@/redux/user/profile";
import { findTutorMeta } from "@/redux/user/tutor";
import UserAvatar from "@litespace/assets/userAvatar";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Card } from "@litespace/luna/Card";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { RefreshUser, useUpdateProfileMedia } from "@litespace/luna/hooks/user";
import { IUser } from "@litespace/types";
import React, { useCallback, useRef, useState } from "react";

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const profile = useAppSelector(profileSelectors.full);
  const dispatch = useAppDispatch();

  const [image, setImage] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");

  const refresh: RefreshUser = useCallback(
    (user?: IUser.Self) => {
      if (user) dispatch(setUserProfile({ user }));

      if (user?.role === IUser.Role.Tutor)
        dispatch(findTutorMeta.call(user.id));
    },
    [dispatch]
  );

  const updateProfileMedia = useUpdateProfileMedia(
    refresh,
    profile.value?.user.id
  );

  const handleImage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setImage(file);
      const f = new FileReader();
      if (!f) return;
      f.onload = (e: any) => {
        setImageSrc(e.target.result);
      };
      f.readAsDataURL(file);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!image) return;
    updateProfileMedia.mutate({ image: image });
  }, [image, updateProfileMedia]);

  console.log("image ", image);

  return (
    <div className="w-full px-8 py-10 mx-auto">
      <PageTitle
        title={intl("settings.profile.title")}
        className="text-xl leading-[30px] font-bold text-natural-950 mb-8"
        fetching={profile.fetching && !profile.loading}
      />
      <Card className="grid grid-cols-12 grid-rows-6 border rounded-2xl w-full p-14 shadow-card min-h-[600px]">
        <div className="col-span-5 grid-cols-12 span grid gap-x-6">
          <div className="col-span-4 w-[102px] h-[102px]">
            {image ? (
              <img
                src={imageSrc}
                className="w-[102px] h-[102px] rounded-full"
              />
            ) : (
              <UserAvatar className="w-full h-full rounded-full dark:stroke-natural-50" />
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg, image/gif, image/png"
            ref={ref}
            onChange={handleImage}
          />
          <div className="col-span-8 grid grid-rows-2 gap-4">
            <Button
              htmlType="button"
              size={ButtonSize.Tiny}
              onClick={() => {
                if (!ref.current) return;
                ref.current.click();
              }}
            >
              {intl("labels.new.image.upload")}
            </Button>
            <Typography
              weight="semibold"
              element="caption"
              className="text-[14px] leading-[21px] text-natural-700 row-start-2"
            >
              {intl("labels.settings.upload.image.message")}
            </Typography>
          </div>
        </div>
        <Button
          size={ButtonSize.Tiny}
          className="col-start-11 row-start-6 col-span-2 justify-self-end self-end"
          onClick={handleSave}
        >
          {intl("labels.save.changes")}
        </Button>
      </Card>
    </div>
  );
};

export default Settings;
