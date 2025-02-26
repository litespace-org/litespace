"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Controller, Form } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";

import {
  useValidateName,
  useValidateContactRequestMessage,
  useValidateContactRequestTitle,
  useRequired,
  useValidatePhone,
} from "@/hooks/validation";
import { useCreateContactRequest } from "@litespace/headless/contactRequest";
import { useToast } from "@litespace/ui/Toast";
import { isRateLimited } from "@litespace/utils";

type IForm = {
  name: string;
  phone: string;
  title: string;
  message: string;
};

const ContactRequestForm: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();

  const required = useRequired();
  const validateName = useValidateName();
  const validatePhone = useValidatePhone();
  const validateTitle = useValidateContactRequestTitle();
  const validateMessage = useValidateContactRequestMessage();

  const { control, handleSubmit, watch, formState, reset } = useForm<IForm>({
    defaultValues: {
      name: "",
      phone: "",
      title: "",
      message: "",
    },
  });

  const name = watch("name");
  const phone = watch("phone");
  const title = watch("title");
  const message = watch("message");
  const errors = formState.errors;

  const createContactRequest = useCreateContactRequest({
    onSuccess() {
      toast.success({
        title: intl("contact-us/form/success/title"),
        description: intl("contact-us/form/success/description"),
      });

      reset();
    },
    onError(error) {
      toast.error({
        title: intl("contact-us/form/error/title"),
        description: isRateLimited(error)
          ? intl("contact-us/form/error/rate-limited")
          : undefined,
      });
    },
  });

  const onSubmit = useCallback(
    (data: IForm) => {
      createContactRequest.mutate(data);
    },
    [createContactRequest]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <div className="flex flex-col sm:mx-auto gap-6 sm:max-w-[502px] h-full">
        <div className="flex flex-col gap-2 sm:gap-4 h-full">
          <Controller.Input
            id="name"
            name="name"
            idleDir="rtl"
            className="flex-1"
            value={name}
            control={control}
            inputSize={"large"}
            autoComplete="off"
            label={intl("contact-us/form/name/label")}
            placeholder={intl("contact-us/form/name/placeholder")}
            state={errors.name ? "error" : undefined}
            helper={errors.name?.message}
            rules={{ validate: validateName, required }}
          />

          <Controller.PatternInput
            mask=" "
            idleDir="rtl"
            id="phone"
            name="phone"
            autoComplete="off"
            value={phone}
            format="### #### ####"
            control={control}
            helper={errors.phone?.message}
            rules={{ validate: validatePhone, required }}
            state={errors.phone ? "error" : undefined}
            label={intl("contact-us/form/phone/label")}
            placeholder={intl("contact-us/form/phone/placeholder")}
          />

          <Controller.Input
            id="title"
            name="title"
            idleDir="rtl"
            value={title}
            control={control}
            inputSize="large"
            autoComplete="off"
            label={intl("contact-us/form/title/label")}
            placeholder={intl("contact-us/form/title/placeholder")}
            state={errors.title ? "error" : undefined}
            helper={errors.title?.message}
            rules={{ validate: validateTitle, required }}
          />

          <Controller.Textarea
            id="message"
            name="message"
            className="h-[135px]"
            idleDir="rtl"
            value={message}
            control={control}
            autoComplete="off"
            label={intl("contact-us/form/message/label")}
            placeholder={intl("contact-us/form/message/placehoder")}
            state={errors.message ? "error" : undefined}
            helper={errors.message?.message}
            rules={{ validate: validateMessage, required }}
          />
        </div>
        <div className="flex gap-4 items-center">
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full"
            loading={createContactRequest.isPending}
            disabled={createContactRequest.isPending}
          >
            {intl("labels/send")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default ContactRequestForm;
