import { languageLevels } from "@/constants/student";
import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateStudent } from "@litespace/headless/student";
import { IStudent, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input } from "@litespace/ui/Input";
import { validateEnglishLevel } from "@litespace/ui/lib/validate";
import { Select } from "@litespace/ui/Select";
import { Textarea } from "@litespace/ui/Textarea";
import { useToast } from "@litespace/ui/Toast";
import React, { useCallback, useMemo } from "react";

type IForm = {
  career: string;
  level: IStudent.EnglishLevel;
  aim: string;
};

const Bio: React.FC<{ next: Void }> = ({ next }) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

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

  const levels = useMemo(
    () =>
      Object.entries(languageLevels).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const updateStudent = useUpdateStudent({ onSuccess, onError });

  // ============= Form ==============
  const validators = useMakeValidators<IForm>({
    career: { required: false },
    level: { required: false, validate: validateEnglishLevel },
    aim: { required: false },
  });

  const form = useForm<IForm>({
    defaults: {
      career: "",
      level: IStudent.EnglishLevel.Beginner,
      aim: "",
    },
    validators,
    onSubmit: (data) => {
      if (!user) return;
      updateStudent.mutate({
        payload: {
          id: user.id,
          jobTitle: data.career,
          englishLevel: data.level,
          learningObjective: data.aim,
        },
      });
    },
  });

  return (
    <Form onSubmit={form.onSubmit} className="w-full max-w-[448px]">
      <div className="flex flex-col mx-auto gap-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Input
            id="job"
            name="job"
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
            {intl("labels.confirm")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Bio;
