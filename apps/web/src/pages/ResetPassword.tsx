import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/ui/Button";
import { Label, Controller } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useValidatePassword } from "@litespace/ui/hooks/validation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "@litespace/headless/auth";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";
import Header from "@/components/Auth/Header";
import Aside from "@/components/Auth/Aside";
import { Typography } from "@litespace/ui/Typography";
import Spinner from "@litespace/assets/Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

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
  const navigate = useNavigate();
  const validatePassword = useValidatePassword(true);
  const toast = useToast();
  const user = useUserContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) return;
    const searchParamToken = searchParams.get("token");
    if (!searchParamToken) return navigate(Route.Root);
    setToken(searchParamToken);
    setSearchParams({});
  }, [navigate, searchParams, setSearchParams, token]);

  const { control, watch, handleSubmit, reset } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmedPassword: "",
    },
  });

  const password = watch("password");
  const confirmedPassword = watch("confirmedPassword");

  const onSuccess = useCallback(
    (profile: IUser.ResetPasswordApiResponse) => {
      reset();
      user.set({ user: profile.user, token: profile.token });
    },
    [reset, user]
  );

  const onError = useCallback(
    (error: unknown) => {
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
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col items-center w-full max-w-[554px]">
          <div className="mt-[calc(50vh-50%)] w-full">
            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-[363px] mb-10 mx-auto">
              <Typography
                element="h4"
                weight="semibold"
                className="text-natural-950"
              >
                {intl("reset-password.title")}
              </Typography>
              <Typography element="body" className="text-natural-700">
                {intl("reset-password.description")}
              </Typography>
            </div>

            <AnimatePresence initial={false} mode="wait">
              {resetPassword.isPending ? (
                <Animate key="submitting">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <Spinner className="w-[110px] fill-brand-700" />
                    <Typography element="body" className="text-natural-700">
                      {intl("reset-password.setting-password")}
                    </Typography>
                  </div>
                </Animate>
              ) : null}

              {resetPassword.isSuccess ? (
                <Animate key="success">
                  <Button
                    className="w-full"
                    onClick={() => navigate(Route.Root)}
                  >
                    {intl("reset-password.login")}
                  </Button>
                </Animate>
              ) : null}

              {!resetPassword.isPending && !resetPassword.isSuccess ? (
                <Animate key="form">
                  <Form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-8 w-full"
                  >
                    <div>
                      <Label id="new-password">
                        {intl("reset-password.new-password")}
                      </Label>
                      <Controller.Password
                        disabled={resetPassword.isPending}
                        value={password}
                        id="new-password"
                        control={control}
                        rules={{ validate: validatePassword }}
                        name="password"
                      />
                    </div>
                    <div>
                      <Label id="repeat-new-password">
                        {intl("reset-password.confirm-new-password")}
                      </Label>
                      <Controller.Password
                        id="repeat-new-password"
                        disabled={resetPassword.isPending}
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
                      />
                    </div>
                    <Button
                      disabled={resetPassword.isPending}
                      loading={resetPassword.isPending}
                      type={ButtonType.Main}
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Small}
                      className="w-full"
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
      <Aside />
    </div>
  );
};

export default ResetPassword;
