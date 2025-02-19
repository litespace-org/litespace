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
  useValidateEmail,
} from "@/hooks/validation";
import { useCreateContactRequest } from "@litespace/headless/contactRequest";
import { useToast } from "@litespace/ui/Toast";

type IForm = {
  name: string;
  email: string;
  title: string;
  message: string;
};

const ContactRequestForm: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();

  const validateName = useValidateName();
  const validateEmail = useValidateEmail();
  const validateTitle = useValidateContactRequestTitle();
  const validateMessage = useValidateContactRequestMessage();

  const { control, handleSubmit, watch, formState } = useForm<IForm>({
    defaultValues: {
      name: "",
      email: "",
      title: "",
      message: "",
    },
  });

  const name = watch("name");
  const email = watch("email");
  const title = watch("title");
  const message = watch("message");
  const errors = formState.errors;

  const submitContactRequest = useCreateContactRequest({
    onSuccess: () => {
      toast.success({
        title: intl("success/form/contact-us"),
      });
      control._reset();
    },
    onError: () => {
      toast.success({
        title: intl("error/form/contact-us"),
        description: intl("error/server"),
      });
    },
  });

  const onSubmit = useCallback(
    (data: IForm) => {
      submitContactRequest.mutate(data);
    },
    [submitContactRequest]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <div className="flex flex-col sm:mx-auto gap-6 sm:max-w-[404px] h-full">
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
            label={intl("section/contact-us/form/label/name")}
            placeholder={intl("section/contact-us/form/placeholder/name")}
            state={errors.name ? "error" : undefined}
            helper={errors.name?.message}
            rules={{ validate: validateName }}
          />

          <Controller.Input
            id="email"
            control={control}
            idleDir="rtl"
            inputSize="large"
            name="email"
            value={email}
            label={intl("section/contact-us/form/label/email")}
            placeholder={intl("section/contact-us/form/placeholder/email")}
            state={errors.email ? "error" : undefined}
            helper={errors.email?.message}
            rules={{ validate: validateEmail }}
            autoComplete="off"
          />

          <Controller.Input
            id="title"
            name="title"
            idleDir="rtl"
            value={title}
            control={control}
            inputSize={"large"}
            autoComplete="off"
            label={intl("section/contact-us/form/label/title")}
            placeholder={intl("section/contact-us/form/placeholder/title")}
            state={errors.title ? "error" : undefined}
            helper={errors.title?.message}
            rules={{ validate: validateTitle }}
          />

          <Controller.Textarea
            id="message"
            name="message"
            className="h-[135px]"
            idleDir="rtl"
            value={message}
            control={control}
            autoComplete="off"
            label={intl("section/contact-us/form/label/message")}
            placeholder={intl("section/contact-us/form/placeholder/message")}
            state={errors.message ? "error" : undefined}
            helper={errors.message?.message}
            rules={{ validate: validateMessage }}
          />
        </div>
        <div className="flex gap-4 items-center">
          <Button type="main" size="large" htmlType="submit" className="w-full">
            {intl("labels/send")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default ContactRequestForm;
