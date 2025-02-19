// TODO: convert this component to server side once Typography task is done
"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Controller, Form } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";

type IForm = {
  name: string;
  email: string;
  title: string;
  message: string;
};

const ContactRequestForm: React.FC = () => {
  const intl = useFormatMessage();

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

  const onSubmit = useCallback((data: IForm) => {
    // TODO: submit form data
    console.log(data);
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:mx-auto gap-6 sm:max-w-[404px]">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Controller.Input
            id="name"
            name="name"
            idleDir="rtl"
            value={name}
            control={control}
            inputSize={"large"}
            autoComplete="off"
            label={intl("section/contact-us/form/label/name")}
            placeholder={intl("section/contact-us/form/placeholder/name")}
            state={errors.name ? "error" : undefined}
            helper={errors.name?.message}
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
          />

          {/* TODO: use textarea here}*/}
          <Controller.Input
            id="message"
            name="message"
            idleDir="rtl"
            value={message}
            control={control}
            autoComplete="off"
            label={intl("section/contact-us/form/label/message")}
            placeholder={intl("section/contact-us/form/placeholder/message")}
            state={errors.message ? "error" : undefined}
            helper={errors.message?.message}
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
