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
import { Link } from "react-router-dom";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  const mq = useMediaQuery();
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
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
        <Header />

        <div className="flex-1 flex flex-col items-center max-w-[554px] w-full">
          <div className="flex-1 flex justify-center items-start sm:items-center w-full">
            <AnimatePresence initial={false} mode="wait">
              {!sentEmail ? (
                <Animate key="form">
                  <div className="flex flex-col items-start sm:items-center gap-4 sm:gap-2 text-start sm:text-center max-w-[363px] mb-6 sm:mb-10 sm:mx-auto">
                    <Typography
                      element={{ default: "subtitle-1", lg: "h4" }}
                      weight="semibold"
                      className="text-natural-950"
                    >
                      {intl("forget-password.title")}
                    </Typography>
                    <Typography
                      element={{ default: "tiny-text", lg: "body" }}
                      className="text-natural-700"
                    >
                      {intl("forget-password.description")}
                    </Typography>
                  </div>

                  <Form onSubmit={onSubmit} className="mb-6">
                    <div className="mb-6">
                      <Controller.Input
                        id="email"
                        name="email"
                        idleDir="rtl"
                        control={control}
                        value={watch("email")}
                        autoComplete="off"
                        label={intl("labels.email")}
                        rules={{ validate: validateEmail }}
                        disabled={forgetPassword.isPending}
                        helper={errors.email?.message}
                        state={errors.email ? "error" : undefined}
                        placeholder={intl("labels.email.placeholder")}
                      />
                    </div>

                    <Button
                      size="large"
                      variant="primary"
                      className="w-full"
                      htmlType="submit"
                      loading={forgetPassword.isPending}
                      disabled={forgetPassword.isPending}
                    >
                      {intl("forget-password.send-link")}
                    </Button>
                  </Form>

                  <div className="w-full text-center">
                    <Typography element="caption" weight="medium">
                      {intl("forget-password.password-remembered")}
                    </Typography>
                    <Link to={Route.Login} className="px-1">
                      <Typography
                        element="caption"
                        weight="medium"
                        className="text-brand-700"
                      >
                        {intl("labels.login")}
                      </Typography>
                    </Link>
                  </div>
                </Animate>
              ) : null}

              {sentEmail ? (
                <Animate key="email-sent">
                  <div className="flex flex-col items-start sm:items-center text-right sm:text-center justify-center gap-4 sm:gap-2 mb-6">
                    <Typography
                      element={{ default: "subtitle-1", lg: "h4" }}
                      weight={{ default: "bold", lg: "semibold" }}
                      className="text-natural-950 w-[230px] sm:w-auto"
                    >
                      {intl("forget-password.check-inbox")}
                    </Typography>
                    <Typography
                      element={{ default: "tiny-text", lg: "body" }}
                      className="text-natural-700"
                    >
                      {intl("forget-password.check-inbox.description")}
                    </Typography>
                  </div>

                  <Button
                    variant="tertiary"
                    size="medium"
                    className="mx-auto"
                    onClick={() => {
                      setSentEmail(false);
                    }}
                  >
                    <Typography weight="semibold">
                      {intl("forget-password.re-send-email")}
                    </Typography>
                  </Button>
                </Animate>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default ForgetPassword;
