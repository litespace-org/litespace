import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import { Route } from "@/types/routes";
import { useForgetPassword } from "@litespace/headless/auth";
import { Button } from "@litespace/ui/Button";
import { Controller, Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useValidateEmail } from "@litespace/ui/hooks/validation";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { AnimatePresence, motion } from "framer-motion";

type FormData = {
  email: string;
};

const callbackUrl = window.location.origin + Route.ResetPassword;

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: "linear",
        },
      }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const ForgetPassword: React.FC = () => {
  const toast = useToast();
  const intl = useFormatMessage();
  const validateEmail = useValidateEmail(true);
  const [sentEmail, setSentEmail] = useState<boolean>(false);
  const { watch, handleSubmit, control, reset, formState } = useForm<FormData>({
    defaultValues: { email: "" },
  });
  const errors = formState.errors;

  const forgetPassword = useForgetPassword({
    onSuccess() {
      setSentEmail(true);
      reset();
    },
    onError(error) {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("forget-password.error"),
        description: intl(errorMessage),
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((data) => {
        forgetPassword.mutate({
          callbackUrl,
          email: data.email,
        });
      }),
    [forgetPassword, handleSubmit]
  );

  return (
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col items-center max-w-[554px] w-full">
          <div className="w-full mt-[calc(50vh-50%)]">
            <AnimatePresence initial={false} mode="wait">
              {!sentEmail ? (
                <Animate key="form">
                  <div className="flex flex-col items-center justify-center gap-2 text-center max-w-[363px] mb-10 mx-auto">
                    <Typography
                      element="h4"
                      weight="semibold"
                      className="text-natural-950"
                    >
                      {intl("forget-password.title")}
                    </Typography>
                    <Typography element="body" className="text-natural-700">
                      {intl("forget-password.description")}
                    </Typography>
                  </div>

                  <Form onSubmit={onSubmit}>
                    <div className="mb-8">
                      <Controller.Input
                        control={control}
                        name="email"
                        value={watch("email")}
                        rules={{ validate: validateEmail }}
                        disabled={forgetPassword.isPending}
                        placeholder={intl("labels.email.placeholder")}
                        autoComplete="off"
                        idleDir="ltr"
                        label={intl("labels.email")}
                        state={errors.email ? "error" : undefined}
                        helper={errors.email?.message}
                      />
                    </div>

                    <Button
                      variant={"primary"}
                      size={"small"}
                      className="w-full"
                      htmlType="submit"
                      loading={forgetPassword.isPending}
                      disabled={forgetPassword.isPending}
                    >
                      {intl("forget-password.send-link")}
                    </Button>
                  </Form>
                </Animate>
              ) : null}

              {sentEmail ? (
                <Animate key="email-sent">
                  <div className="flex flex-col items-center justify-center gap-2 text-center mb-8">
                    <Typography
                      element="h4"
                      weight="semibold"
                      className="text-natural-950"
                    >
                      {intl("forget-password.check-inbox")}
                    </Typography>
                    <Typography element="body" className="text-natural-700">
                      {intl("forget-password.check-inbox.description")}
                    </Typography>
                  </div>
                  <Button
                    variant={"tertiary"}
                    size={"small"}
                    className="mx-auto"
                    onClick={() => {
                      setSentEmail(false);
                    }}
                  >
                    {intl("forget-password.re-send-email")}
                  </Button>
                </Animate>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Aside />
    </div>
  );
};

export default ForgetPassword;
