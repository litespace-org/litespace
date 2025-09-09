import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateStudent } from "@litespace/headless/student";
import { useInfiniteTopics, useUserTopics } from "@litespace/headless/topic";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { MultiSelect } from "@litespace/ui/MultiSelect";
import { useToast } from "@litespace/ui/Toast";
import React, { useCallback, useMemo } from "react";

type IForm = {
  topics: string[];
};

const Bio: React.FC<{ next: Void }> = ({ next }) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const {
    query,
    keys: allTopicsQueryKeys,
    list: allTopics,
  } = useInfiniteTopics();

  useOnError({
    type: "query",
    keys: allTopicsQueryKeys,
    error: query.error,
  });

  // ============= Complete Profile Mutation ==============
  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    next();
  }, [invalidateQuery, next]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("complete-profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const { query: userTopics } = useUserTopics();

  const updateStudent = useUpdateStudent({ onSuccess, onError });
  const updateUserTopics = useUpdateUserTopics({ onSuccess, onError });

  const userTopicIds = useMemo(
    () => userTopics.data?.map((t) => t.id),
    [userTopics.data]
  );

  // ============= Form ==============
  const validators = useMakeValidators<IForm>({
    topics: { required: false },
  });

  const form = useForm<IForm>({
    defaults: {
      topics: [],
    },
    validators,
    onSubmit: (data) => {
      if (!user) return;
      updateUserTopics.mutate({
        addTopics: data.topics
          .filter((topic) => !userTopicIds?.includes(Number(topic)))
          .map((t) => Number(t)),
        removeTopics: (userTopicIds || [])
          .filter((topic) => !data.topics.includes(topic.toString()))
          .map((t) => Number(t)),
      });
    },
  });

  return (
    <Form onSubmit={form.onSubmit} className="w-full max-w-[448px]">
      <div className="flex flex-col mx-auto gap-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <MultiSelect
            label={intl("complete-profile.topics.label")}
            options={
              allTopics?.map((topic) => ({
                label: topic.name.ar,
                value: topic.name.ar,
              })) || []
            }
            placeholder={intl("complete-profile.topics.placeholder")}
            values={form.state.topics}
            setValues={(values) => form.set("topics", values)}
          />
        </div>
        <div className="flex gap-4 items-center">
          <Button
            type="main"
            size="large"
            onClick={next}
            htmlType="button"
            className="w-full text"
            variant="secondary"
            disabled={updateStudent.isPending}
          >
            {intl("labels.skip")}
          </Button>
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full text"
            disabled={updateStudent.isPending}
            loading={updateStudent.isPending}
          >
            {intl("complete-profile.start-your-journey")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Bio;
