import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import React, { useCallback, useState } from "react";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { TutorSettingsTabs } from "@/components/TutorSettings/SettingsTabs";
import { useUpdateUserPersonalInfo } from "@litespace/headless/user";
import { useToast } from "@litespace/luna/Toast";
import { useUserContext } from "@litespace/headless/context/user";

type PersonalInfo = {
  name: string;
  bio: string;
  about: string;
};

export const ProfileSettings: React.FC<{
  id: number;
}> = ({ id }) => {
  const tutorInfo = useFindTutorInfo(id);
  const { refetch } = useUserContext();
  const intl = useFormatMessage();
  const toast = useToast();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: tutorInfo.data?.name || "",
    bio: tutorInfo.data?.bio || "",
    about: tutorInfo.data?.about || "",
  });

  const onSuccess = useCallback(() => {
    tutorInfo.refetch();
    refetch.user();
  }, [tutorInfo, refetch]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const changePersonalInfo = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setPersonalInfo((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      })),
    []
  );

  const updateTutor = useUpdateUserPersonalInfo({ onError, onSuccess });

  const mutateTutor = useCallback(() => {
    if (!tutorInfo.data) return;
    return updateTutor.mutate({
      id: tutorInfo.data.id,
      payload: {
        name: personalInfo.name,
        bio: personalInfo.bio,
        about: personalInfo.about,
      },
    });
  }, [tutorInfo.data, updateTutor, personalInfo]);

  if (!tutorInfo.data) return null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between p-10 pb-0">
        <TutorProfileCard variant="small" {...tutorInfo.data} />
        <Button
          loading={updateTutor.isPending}
          disabled={updateTutor.isPending}
          onClick={mutateTutor}
          size={ButtonSize.Small}
        >
          {intl("settings.save")}
        </Button>
      </div>
      <TutorSettingsTabs tutor={tutorInfo.data} update={changePersonalInfo} />
    </div>
  );
};
