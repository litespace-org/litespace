import { languageLevels } from "@/constants/student";
import { useOnError } from "@/hooks/error";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useUpdateStudent, useStudentMeta } from "@litespace/headless/student";
import { useInfiniteTopics } from "@litespace/headless/topic";
import { IStudent, ITopic } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input } from "@litespace/ui/Input";
import { validateEnglishLevel } from "@litespace/ui/lib/validate";
import { LocalId } from "@litespace/ui/locales";
import { MultiSelect } from "@litespace/ui/MultiSelect";
import { Select } from "@litespace/ui/Select";
import { Textarea } from "@litespace/ui/Textarea";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { random } from "lodash";
import React, { useCallback, useMemo } from "react";

type IForm = {
  topics: ITopic.Self["name"]["ar"][];
  career: string;
  level: IStudent.EnglishLevel;
  aim: string;
};

export const StudentPublicInfo: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const { user } = useUser();

  const meta = useStudentMeta();

  const { list: allTopics } = useInfiniteTopics();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("student-settings.updated-successfully"),
    });
  }, [intl, toast]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("complete-profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const updateStudent = useUpdateStudent({ onSuccess, onError });

  const validators = useMakeValidators<IForm>({
    career: { required: false },
    level: { required: false, validate: validateEnglishLevel },
    aim: { required: false },
  });

  const levels = useMemo(
    () =>
      Object.entries(languageLevels).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const form = useForm<IForm>({
    defaults: {
      topics: allTopics
        ? allTopics
            ?.slice(0, random(1, allTopics.length / 2))
            .map((topic) => topic.name.ar)
        : [],
      career: meta.data?.career ? intl(meta.data?.career as LocalId) : "",
      level: meta.data?.level || IStudent.EnglishLevel.Beginner,
      aim: meta.data?.aim ? intl(meta.data?.aim as LocalId) : "",
    },
    validators,
    onSubmit(data) {
      if (!user) return;
      updateStudent.mutate({
        id: user?.id,
        payload: {
          topics: data.topics,
          career: data.career,
          level: data.level,
          aim: data.aim,
        },
      });
    },
  });

  return (
    <div className="w-full">
      <Form onSubmit={form.onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Typography tag="h5" className="text-subtitle-2 font-bold">
            {intl("student-settings.public-info.title")}
          </Typography>
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

          <Input
            id="career"
            name="career"
            idleDir="rtl"
            value={form.state.career}
            inputSize={"large"}
            autoComplete="off"
            onChange={(e) => form.set("career", e.target.value)}
            label={intl("labels.job")}
            placeholder={intl("complete-profile.job.placeholder")}
            state={form.errors.career ? "error" : undefined}
            helper={form.errors.career}
          />

          <Select
            id="level"
            value={form.state.level}
            onChange={(value) => form.set("level", value)}
            options={levels}
            label={intl("complete-profile.level.label")}
            placeholder={intl("complete-profile.level.label")}
            helper={form.errors.level}
          />

          <Textarea
            className="min-h-[138px]"
            id="aim"
            name="aim"
            idleDir="rtl"
            value={form.state.aim}
            label={intl("complete-profile.aim.label")}
            placeholder={intl("complete-profile.aim.placeholder")}
            state={form.errors.aim ? "error" : undefined}
            helper={form.errors.aim}
            onChange={({ target }) => form.set("aim", target.value)}
            disabled={updateStudent.isPending}
            autoComplete="off"
          />
        </div>

        <Button
          size="large"
          htmlType="submit"
          loading={updateStudent.isPending}
          disabled={updateStudent.isPending}
        >
          {intl("shared-settings.save")}
        </Button>
      </Form>
    </div>
  );
};

export default StudentPublicInfo;
