import { Button } from "@litespace/ui/Button";
import { Controller } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useValidatePassword } from "@litespace/ui/hooks/validation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import { useResetPassword } from "@litespace/headless/auth";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import { IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";
import Header from "@/components/Auth/Header";
import Aside from "@/components/Auth/Aside";
import { Typography } from "@litespace/ui/Typography";
import Success from "@litespace/assets/Success";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";

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

interface IForm {
  password: string;
  confirmedPassword: string;
}

const ResetPassword = () => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const navigate = useNavigate();
  const validatePassword = useValidatePassword(true);
  const toast = useToast();
  const user = useUserContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) return;
    const searchParamToken = searchParams.get("token");
    if (!searchParamToken) return navigate(Web.Root);
    setToken(searchParamToken);
    setSearchParams({});
  }, [navigate, searchParams, setSearchParams, token]);

  const { control, watch, handleSubmit, reset, formState } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmedPassword: "",
    },
  });

  const password = watch("password");
  const confirmedPassword = watch("confirmedPassword");
  const errors = formState.errors;

  const onSuccess = useCallback(
    (profile: IUser.ResetPasswordApiResponse) => {
      reset();
      user.set({ user: profile.user, token: profile.token });
    },
    [reset, user]
  );

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("reset-password.error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

  const resetPassword = useResetPassword({ onSuccess, onError });

  const onSubmit = useMemo(() => {
    return handleSubmit(() => {
      if (password !== confirmedPassword || !token) return;
      resetPassword.mutate({ token, password });
    });
  }, [handleSubmit, password, confirmedPassword, token, resetPassword]);

  return (
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
        <Header />

        <div className="flex-1 flex flex-col justify-start items-center max-w-[554px] w-full">
          <div className="flex flex-col justify-start sm:justify-center items-center w-full">
            <div
              className={cn(
                "flex flex-col items-start sm:items-center text-right sm:text-center justify-center",
                "w-full gap-4 sm:gap-2 text-center sm:max-w-[363px]"
              )}
            >
              <Typography
                element={{ default: "subtitle-1", sm: "h4" }}
                weight={{ default: "bold", sm: "semibold" }}
                className="text-natural-950"
              >
                {intl("reset-password.title")}
              </Typography>
              {!resetPassword.isPending && !resetPassword.isSuccess ? (
                <Typography
                  element={{ default: "tiny-text", sm: "body" }}
                  className="text-natural-700"
                >
                  {intl("reset-password.description")}
                </Typography>
              ) : null}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {resetPassword.isSuccess ? (
                <Animate key="success">
                  <div className="flex flex-col items-center gap-2 sm:gap-6 mb-6 sm:mb-8 mt-10">
                    <Success className="w-20 sm:w-[141px] h-20 sm:h-[141px]" />
                    <Typography element="body" className="text-natural-700">
                      {intl("reset-password.done")}
                    </Typography>
                  </div>
                  <Button
                    type="main"
                    size="large"
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(Web.Root)}
                  >
                    {intl("reset-password.go-to-dashboard")}
                  </Button>
                </Animate>
              ) : null}

              {!resetPassword.isPending && !resetPassword.isSuccess ? (
                <Animate key="form">
                  <Form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6 w-full mt-6 sm:mt-10"
                  >
                    <div className="flex flex-col gap-2 sm:gap-4">
                      <Controller.Password
                        idleDir="rtl"
                        disabled={resetPassword.isPending}
                        value={password}
                        id="new-password"
                        control={control}
                        rules={{ validate: validatePassword }}
                        label={intl("reset-password.new-password")}
                        name="password"
                        placeholder={intl(
                          "reset-password.new-password.placeholder"
                        )}
                        helper={errors.password?.message}
                        state={errors.password ? "error" : undefined}
                      />

                      <Controller.Password
                        idleDir="rtl"
                        id="repeat-new-password"
                        disabled={resetPassword.isPending}
                        label={intl("reset-password.confirm-new-password")}
                        value={confirmedPassword}
                        rules={{
                          validate(value, formData) {
                            if (!value) return intl("error.required");
                            if (!value || value !== formData.password)
                              return intl("labels.passwords-not-the-same");
                            return validatePassword(value);
                          },
                        }}
                        control={control}
                        autoComplete="off"
                        name="confirmedPassword"
                        placeholder={intl(
                          "reset-password.confirm-password.placeholder"
                        )}
                        helper={errors.confirmedPassword?.message}
                        state={errors.confirmedPassword ? "error" : undefined}
                      />
                    </div>

                    <Button
                      type="main"
                      size="large"
                      variant="primary"
                      className="w-full"
                      disabled={resetPassword.isPending}
                      loading={resetPassword.isPending}
                    >
                      {intl("labels.confirm")}
                    </Button>
                  </Form>
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

export default ResetPassword;
