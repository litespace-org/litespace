import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { Dashboard } from "@litespace/utils/routes";
import ArrowRight from "@litespace/assets/ArrowRight";
import Video from "@litespace/assets/VideoClip";
import UploadImage from "@litespace/assets/UploadImage";

import { useFindStudioTutor } from "@litespace/headless/tutor";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";

import {
  AvatarSection,
  ConfirmDialog,
  ThumbnailSection,
  VideoSection,
} from "@/components/PhotoSession";

const PhotoSession = () => {
  const intl = useFormatMessage();
  const params = useParams();

  const studioId = useMemo(() => Number(params["studioId"]), [params]);
  const tutorId = useMemo(() => Number(params["tutorId"]), [params]);

  const tutorQuery = useFindStudioTutor(studioId, tutorId);

  const [dialogVisibility, setDialogVisibility] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogIcon, setDialogIcon] = useState<React.ReactNode>(<Video />);

  // used for dialog retry action
  const [mutateAssetParam, setMutateAssetParam] = useState({ tutorId });

  const mutateAsset = useUploadTutorAssets({});
  const mutateUser = useUpdateUser({});

  const actionsDisabled = useMemo(
    () => mutateAsset.mutation.isPending || mutateUser.isPending,
    [mutateAsset.mutation.isPending, mutateUser.isPending]
  );

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <ConfirmDialog
        mutateUser={mutateUser}
        mutateAsset={mutateAsset}
        title={dialogTitle}
        icon={dialogIcon}
        open={dialogVisibility}
        onClose={() => setDialogVisibility(false)}
        onTryAgain={() => {
          mutateAsset.mutation.reset();
          mutateAsset.mutation.mutateAsync(mutateAssetParam);
        }}
      />

      <div className="flex items-center w-full gap-6 mb-6">
        <Link to={Dashboard.PhotoSessions}>
          <ArrowRight className="w-6 h-6 stroke-brand-700" />
        </Link>
        <Typography tag="h1" className="text-subtitle-2 font-bold">
          {intl("dashboard.photo-sessions.title")}
          {" / "}
          <Typography
            tag="span"
            className="text-subtitle-2 font-bold text-brand-700 underline"
          >
            {tutorQuery.data?.name}
          </Typography>
        </Typography>
      </div>

      <div className="flex flex-col gap-10">
        <AvatarSection
          tutorQuery={tutorQuery}
          mutateUser={mutateUser}
          mutateAsset={mutateAsset}
          disabled={actionsDisabled}
          onUpload={() => {
            setDialogVisibility(true);
            setDialogIcon(<UploadImage />);
            setMutateAssetParam((asset) => ({ tutorId, image: asset }));
            setDialogTitle(
              intl("dashboard.photo-session.confirmation-dialog.avatar-title")
            );
          }}
        />

        <VideoSection
          tutorQuery={tutorQuery}
          mutateAsset={mutateAsset}
          mutateUser={mutateUser}
          disabled={actionsDisabled}
          onUpload={(asset) => {
            setDialogVisibility(true);
            setDialogIcon(<Video />);
            setMutateAssetParam(() => ({ tutorId, video: asset }));
            setDialogTitle(
              intl("dashboard.photo-session.confirmation-dialog.video-title")
            );
          }}
        />

        <ThumbnailSection
          tutorQuery={tutorQuery}
          mutateAsset={mutateAsset}
          mutateUser={mutateUser}
          disabled={actionsDisabled}
          onUpload={(asset) => {
            setDialogVisibility(true);
            setDialogIcon(<UploadImage />);
            setMutateAssetParam(() => ({ tutorId, thumbnail: asset }));
            setDialogTitle(
              intl(
                "dashboard.photo-session.confirmation-dialog.thumbnail-title"
              )
            );
          }}
        />
      </div>
    </div>
  );
};

export default PhotoSession;
