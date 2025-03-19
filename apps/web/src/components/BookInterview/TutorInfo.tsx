import { Controller, Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "react-hook-form";
import { Button } from "@litespace/ui/Button";
import ArrowLeftLong from "@litespace/assets/ArrowLeftLong";
import { useValidateBio } from "@litespace/ui/hooks/validation";
import { Void } from "@litespace/types";
import { useUpdateFullTutor } from "@litespace/headless/user";
import { capture } from "@/lib/sentry";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@litespace/ui/Toast";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { orNull } from "@litespace/utils";
import { isEqual } from "lodash";
import { Topics } from "@/components/BookInterview/Topics";

type FormProps = {
  bio: string | null;
  about: string | null;
  topics: number[];
};

const TutorInfo: React.FC<{
  goNext: Void;
  tutorInfo: {
    id?: number;
    bio: string | null;
    about: string | null;
  };
}> = ({ tutorInfo, goNext }) => {
  const intl = useFormatMessage();
  const validateBio = useValidateBio();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const topics = useTopics({});
  const userTopics = useUserTopics();

  const [selectedTopicsIds, setSelectedTopicsIds] = useState<number[]>([]);

  const allTopics = useMemo(() => {
    if (!topics.query.data) return [];
    return topics.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [topics.query.data]);

  const userTopicsIds = useMemo(() => {
    if (!userTopics.data) return [];
    return userTopics.data.map((topic) => topic.id);
  }, [userTopics.data]);

  useEffect(() => {
    setSelectedTopicsIds(userTopicsIds);
  }, [userTopicsIds]);

  const form = useForm<FormProps>({
    defaultValues: {
      bio: tutorInfo.bio,
      about: tutorInfo.about,
    },
  });
  const errors = form.formState.errors;
  const bio = form.watch("bio");
  const about = form.watch("about");

  const chooseTopic = useCallback(
    (topic: number) => {
      if (selectedTopicsIds.includes(topic))
        return setSelectedTopicsIds((prev) =>
          prev.filter((selectedTopic) => selectedTopic !== topic)
        );
      return setSelectedTopicsIds([...selectedTopicsIds, topic]);
    },
    [selectedTopicsIds]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
    goNext();
  }, [invalidateQuery, goNext]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      toast.error({
        title: intl("tutor.onboarding.tutor-info.form.error"),
        description: intl(getErrorMessageId(error)),
      });
    },
    [intl, toast]
  );

  const dataChanged = useMemo(
    () =>
      orNull(bio?.trim()) !== tutorInfo.bio ||
      orNull(about?.trim()) !== tutorInfo.about ||
      !isEqual(userTopicsIds, selectedTopicsIds),
    [about, bio, tutorInfo, userTopicsIds, selectedTopicsIds]
  );

  const updateTutor = useUpdateFullTutor({ onSuccess, onError });

  const submit = useCallback(
    (data: FormProps) => {
      if (!tutorInfo.id) return;
      const addTopics: number[] = selectedTopicsIds.filter(
        (topic) => !userTopicsIds.includes(topic)
      );

      const removeTopics: number[] = userTopicsIds.filter(
        (topic) => !selectedTopicsIds.includes(topic)
      );

      return updateTutor.mutate({
        id: tutorInfo.id,
        payload: {
          bio: data.bio?.trim(),
          about: data.about?.trim(),
          addTopics,
          removeTopics,
        },
      });
    },
    [updateTutor, userTopicsIds, selectedTopicsIds, tutorInfo.id]
  );

  return (
    <div className="mt-14 flex flex-col items-center gap-16">
      <div className="flex flex-col gap-2 items-center">
        <Typography tag="h2" className="text-h3 font-bold text-natural-950">
          {intl("tutor.onboarding.tutor-info.title")}
        </Typography>
        <Typography tag="h2" className="text-body text-natural-700">
          {intl("tutor.onboarding.tutor-info.description")}
        </Typography>
      </div>
      <Form
        onSubmit={form.handleSubmit(submit)}
        className="max-w-[597px] w-full flex flex-col gap-4"
      >
        <Controller.Input
          name="bio"
          control={form.control}
          label={intl("tutor.onboarding.tutor-info.form.bio")}
          rules={{ validate: validateBio }}
          placeholder={intl("tutor.onboarding.tutor-info.form.bio.placeholder")}
          state={errors.bio ? "error" : undefined}
          helper={errors.bio?.message}
        />
        <Controller.Textarea
          control={form.control}
          name="about"
          className="min-h-[138px]"
          label={intl("tutor.onboarding.tutor-info.form.about")}
          placeholder={intl(
            "tutor.onboarding.tutor-info.form.about.placeholder"
          )}
          state={errors.about ? "error" : undefined}
          helper={errors.about?.message}
        />
        <div className="flex flex-col gap-4">
          <Typography
            tag="h4"
            className="text-caption font-semibold text-natural-950"
          >
            {intl("tutor.onboarding.tutor-info.form.topics")}
          </Typography>
          {topics.query.data ? (
            <Topics
              loading={topics.query.isPending}
              error={topics.query.isError}
              retry={topics.query.refetch}
              chooseTopic={chooseTopic}
              topics={allTopics}
              userTopics={selectedTopicsIds}
            />
          ) : null}{" "}
        </div>
        <Button
          size="large"
          disabled={!dataChanged}
          endIcon={<ArrowLeftLong />}
          className="w-[133px] mt-10"
        >
          {intl("labels.next")}
        </Button>
      </Form>
    </div>
  );
};

export default TutorInfo;
