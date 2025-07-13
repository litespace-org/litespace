import React, { useCallback } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { IUser } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import {
  isEmptyObject,
  getOptionalFieldUpdatedValue,
} from "@litespace/utils/utils";
import ProfileCard from "@/components/TutorProfileSettings/ProfileCard";
import { Typography } from "@litespace/ui/Typography";
import { useOnError } from "@/hooks/error";
import { useForm } from "@litespace/headless/form";
import { MAX_TUTOR_ABOUT_TEXT_LENGTH } from "@litespace/utils/constants";
import { Textarea } from "@litespace/ui/Textarea";
import { Input } from "@litespace/ui/Input";
import TopicSelection from "@/components/Settings/TopicSelection";
import { useBlock } from "@litespace/ui/hooks/common";
import { Button } from "@litespace/ui/Button";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import {
  validateTutorAbout,
  validateTutorBio,
  validateTutorName,
} from "@litespace/ui/lib/validate";

type TutorProfile = {
  id: number;
  name: string | null;
  bio: string | null;
  about: string | null;
  image: string | null;
  studentCount: number;
  lessonCount: number;
  avgRating: number;
};

export type Form = {
  name: string;
  bio: string;
  about: string;
};

function asUpdatePayload(
  tutor: TutorProfile,
  form: Form
): IUser.UpdateApiPayload {
  return {
    name: getOptionalFieldUpdatedValue(tutor.name, form.name.trim()),
    bio: getOptionalFieldUpdatedValue(tutor.bio, form.bio.trim()),
    about: getOptionalFieldUpdatedValue(tutor.about, form.about.trim()),
  };
}

const Content: React.FC<TutorProfile> = ({ ...tutor }) => {
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor-settings.profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, tutor.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
  }, [invalidateQuery, tutor.id]);

  const updateTutor = useUpdateUser({
    onError,
    onSuccess,
  });

  const validators = useMakeValidators<Form>({
    bio: {
      required: true,
      validate: validateTutorBio,
    },
    about: {
      required: true,
      validate: validateTutorAbout,
    },
    name: {
      required: true,
      validate: validateTutorName,
    },
  });

  const form = useForm<Form>({
    defaults: {
      name: tutor.name || "",
      bio: tutor.bio || "",
      about: tutor.about || "",
    },
    validators,
    onSubmit: (form) => {
      updateTutor.mutate({
        id: tutor.id,
        payload: asUpdatePayload(tutor, form),
      });
    },
  });

  useBlock(() => {
    return !isEmptyObject(asUpdatePayload(tutor, form.state));
  });

  return (
    <div>
      <form onSubmit={form.onSubmit} className="flex flex-col gap-6">
        <div className="sm:flex sm:justify-between">
          <ProfileCard
            id={tutor.id}
            image={tutor.image}
            name={tutor.name}
            bio={tutor.bio}
            studentCount={tutor.studentCount}
            lessonCount={tutor.lessonCount}
            avgRating={tutor.avgRating}
          />
        </div>
        <div className="flex flex-col gap-6 lg:gap-6 md:pb-10">
          <Typography
            tag="h1"
            className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
          >
            {intl("tutor-settings.personal-info.title")}
          </Typography>
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 -mt-2 lg:mt-0">
            <Input
              id="name"
              label={intl("labels.name")}
              placeholder={intl("labels.name.placeholder")}
              value={form.state.name}
              onChange={(e) => form.set("name", e.target.value)}
              state={form.errors.name ? "error" : undefined}
              helper={form.errors.name}
              disabled={updateTutor.isPending}
              autoComplete="off"
            />
            <Input
              id="bio"
              label={intl("labels.bio")}
              placeholder={intl("labels.bio.placeholder")}
              value={form.state.bio}
              onChange={(e) => form.set("bio", e.target.value)}
              state={form.errors.bio ? "error" : undefined}
              helper={form.errors.bio}
              disabled={updateTutor.isPending}
              autoComplete="off"
            />
          </div>

          <Textarea
            id="about"
            name="about"
            label={intl("tutor-settings.personal-info.about")}
            placeholder={intl("labels.about.placeholder")}
            maxAllowedCharacters={MAX_TUTOR_ABOUT_TEXT_LENGTH}
            value={form.state.about}
            state={form.errors.about ? "error" : undefined}
            helper={form.errors.about}
            onChange={(e) => form.set("about", e.target.value)}
            disabled={updateTutor.isPending}
            autoComplete="off"
            rows={15}
          />

          <Button
            size="large"
            type="main"
            variant="primary"
            loading={updateTutor.isPending}
            disabled={
              updateTutor.isPending ||
              isEmptyObject(asUpdatePayload(tutor, form.state))
            }
          >
            <Typography tag="span" className="text-body font-medium">
              {intl("shared-settings.save")}
            </Typography>
          </Button>
        </div>
      </form>
      <TopicSelection />
    </div>
  );
};

export default Content;
