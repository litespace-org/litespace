import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { IUser, Void } from "@litespace/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { PatternInput } from "@/components/PatternInput";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@/hooks/validation";
import { Button } from "@/components/Button";
import { Link } from "react-router-dom";
import cn from "classnames";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import WhatsApp from "@litespace/assets/WhatsApp";
import Telegram from "@litespace/assets/Telegram";
import { isValidConfirmationCode, isValidPhone } from "@/lib/validate";
import { Popover } from "@/components/Popover";
import { TELEGRAM_NUMBER } from "@litespace/utils";
import { LocalId } from "@/locales";

type Payload = {
  method: IUser.NotificationMethodLiteral;
  phone: string;
};

type VerifyPhoneDialog = {
  open: boolean;
  onClose: Void;
  phone: string | null;
  sendCode(payload: Payload): void;
  sendingCode: boolean;
  sentCode: boolean;
  unresolvedPhone: boolean;
  verifyCode(code: number): void;
  verifyingCode: boolean;
  resend(payload: Payload): void;
  resending: boolean;
};

type IForm = {
  phone: string;
  method: "whatsapp" | "telegram" | null;
  code: number;
};

export const VerifyPhoneDialog: React.FC<VerifyPhoneDialog> = ({
  open,
  onClose,
  phone,
  resend,
  sendCode,
  sendingCode,
  resending,
  sentCode,
  unresolvedPhone,
  verifyCode,
  verifyingCode,
}) => {
  const intl = useFormatMessage();
  const [newPhone, setNewPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const step = useMemo(() => {
    if (sentCode) return "code";
    if (unresolvedPhone) return "unresolvedPhone";
    if (newPhone || phone) return "method";
    if (!phone) return "phone";
  }, [newPhone, phone, sentCode, unresolvedPhone]);

  const validators = useMakeValidators<IForm>({
    phone:
      step === "phone"
        ? {
            required: true,
            validate(value) {
              const handledPhoneNumber = value.split(" ").join("");
              return isValidPhone(handledPhoneNumber);
            },
          }
        : undefined,
    method:
      step === "method"
        ? {
            required: true,
          }
        : undefined,
    code:
      step === "code"
        ? {
            required: true,
            validate: isValidConfirmationCode,
          }
        : undefined,
  });

  const form = useForm<IForm>({
    defaults: {
      phone: phone ? phone : "",
      method: null,
      code: 0,
    },
    validators,
    onSubmit(data) {
      if (step === "phone") {
        setNewPhone(data.phone);
        form.set("phone", data.phone);
      }
      if (!data.phone || !data.method) return;
      if (step === "method")
        sendCode({ method: data.method, phone: data.phone });
      if (step === "unresolvedPhone")
        sendCode({ method: data.method, phone: data.phone });
      if (step === "code") {
        verifyCode(form.state.code);
        onClose();
      }
    },
  });

  const copy = useCallback(async () => {
    const handledNumber = TELEGRAM_NUMBER.split("-").join("");
    await navigator.clipboard.writeText(handledNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1_500);
  }, []);

  const disabledSumbit = useMemo(() => {
    return (
      (step === "phone" && !form.state.phone) ||
      (step === "method" && !form.state.method) ||
      (step === "unresolvedPhone" && sendingCode) ||
      (step === "code" && verifyingCode) ||
      (step === "code" && !form.state.code)
    );
  }, [
    form.state.code,
    form.state.method,
    form.state.phone,
    sendingCode,
    step,
    verifyingCode,
  ]);

  const submitLabel: LocalId = useMemo(() => {
    if (step === "phone" || step === "method") return "global.labels.next";
    if (step === "unresolvedPhone") return "labels.try-again";
    return "labels.confirm";
  }, [step]);

  return (
    <Dialog
      open={open}
      close={onClose}
      title={
        <Typography
          tag="span"
          className="text-subtitle-1 font-bold text-natural-950"
        >
          {intl("verify-phone-dialog.title")}
        </Typography>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
      >
        {/* ================= phone ================= */}
        {step === "phone" ? (
          <div className="pt-2">
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950 mb-6"
            >
              {intl("verify-phone-dialog.empty-phone.description")}
            </Typography>
            <PatternInput
              id="phone"
              autoFocus
              format="### #### ####"
              label={intl("labels.phone")}
              placeholder={
                phone ? phone : intl("verify-phone-dialog.phone.placeholder")
              }
              onChange={(e) => form.set("phone", e.target.value)}
              state={form.errors?.phone ? "error" : undefined}
              inputSize="large"
              helper={form.errors?.phone}
              value={form.state.phone}
            />
          </div>
        ) : null}
        {/* ================= method ================= */}
        {step === "method" ? (
          <div className="pt-2">
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950"
            >
              {intl("verify-phone-dialog.method.description")}
            </Typography>
            <div className="flex flex-row justify-center items-center gap-6 mt-6">
              <div
                onClick={() => form.set("method", "whatsapp")}
                className={cn(
                  "relative hover:cursor-pointer rounded-2xl py-[26px] bg-natural-200 hover:bg-natural-300 active:bg-whatsapp-background flex-1 flex flex-col gap-2 justify-center items-center"
                )}
                style={{
                  backgroundImage:
                    form.state.method === "whatsapp"
                      ? "radial-gradient(rgba(97, 253, 125, 1), rgba(37, 207, 67, 1))"
                      : undefined,
                }}
              >
                <WhatsApp className="w-8 h-8 [&>*]:fill-natural-50" />
                <Typography
                  tag="h5"
                  className="text-body font-bold text-natural-50"
                >
                  {intl("verify-phone-dialog.whatsapp")}
                </Typography>
              </div>
              <div
                onClick={() => form.set("method", "telegram")}
                className={cn(
                  "rounded-2xl py-[26px] bg-natural-200 flex-1 flex flex-col gap-2 justify-center items-center",
                  "hover:cursor-pointer hover:bg-natural-300 active:bg-telegram-background"
                )}
                style={{
                  backgroundImage:
                    form.state.method === "telegram"
                      ? "radial-gradient(rgba(42, 171, 238, 1), rgba(34, 158, 217, 1))"
                      : undefined,
                }}
              >
                <Telegram />
                <Typography
                  tag="h5"
                  className="text-body font-bold text-natural-50"
                >
                  {intl("verify-phone-dialog.telegram")}
                </Typography>
              </div>
            </div>
          </div>
        ) : null}
        {/* ================= unresolved phone ================= */}
        {unresolvedPhone ? (
          <div className="pt-2 flex flex-col gap-6">
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950"
            >
              {intl("verify-phone-dialog.telegram.privacy-issue.description-1")}
            </Typography>
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950"
            >
              {intl("verify-phone-dialog.telegram.privacy-issue.description-2")}
            </Typography>
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950"
            >
              {intl.rich(
                "verify-phone-dialog.telegram.privacy-issue.description-3",
                {
                  phone: (
                    <Popover
                      content={
                        <Typography tag="span">
                          {copied ? "copied" : "click to copy"}
                        </Typography>
                      }
                    >
                      <Typography
                        dir="ltr"
                        tag="span"
                        className="hover:bg-natural-100 rounded-lg hover:cursor-pointer text-caption font-semibold text-natural-950"
                        onClick={copy}
                      >
                        {TELEGRAM_NUMBER}
                      </Typography>
                    </Popover>
                  ),
                  value: (
                    <Link to="https://web.telegram.org/a/#7479680645">
                      <Typography
                        dir="ltr"
                        tag="span"
                        className={cn(
                          "text-caption font-semibold text-brand-700",
                          'relative after:absolute after:content-["_"] after:right-0 after:left-0 after:bottom-1 after:w-full after:h-[1px] after:bg-brand-700'
                        )}
                      >
                        @litespace_notify
                      </Typography>
                    </Link>
                  ),
                }
              )}
            </Typography>
          </div>
        ) : null}
        {/* ================= confirmation code ================= */}
        {step === "code" ? (
          <div className="pt-2">
            <Typography
              tag="h6"
              className="text-caption font-semibold text-natural-950"
            >
              {intl("verify-phone-dialog.confirm-code.description")}
            </Typography>
            <div className="flex flex-col items-center gap-6 my-12">
              <Typography
                tag="h6"
                className="text-caption font-semibold text-natural-600"
              >
                {intl.rich("verify-phone-dialog.phone", {
                  phone: (
                    <Typography
                      dir="ltr"
                      tag="span"
                      className="text-natural-950 font-semibold text-caption"
                    >
                      {form.state.phone}
                    </Typography>
                  ),
                })}
              </Typography>
              <ConfirmationCode
                autoFocus
                setCode={(code) => form.set("code", code)}
                disabled={verifyingCode}
              />
              <Button
                variant="tertiary"
                onClick={() => {
                  if (!form.state.phone || !form.state.method) return;
                  resend({
                    method: form.state.method,
                    phone: form.state.phone,
                  });
                }}
                disabled={resending}
              >
                <Typography
                  tag="h6"
                  className="text-body font-medium text-natural-700"
                >
                  {intl("verify-phone-dialog.resend")}
                </Typography>
              </Button>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex gap-6">
          <Button
            size="large"
            className="flex-1"
            htmlType="submit"
            disabled={disabledSumbit}
            loading={sendingCode || verifyingCode}
          >
            <Typography
              tag="span"
              className="text-body font-medium text-natural-50"
            >
              {intl(submitLabel)}
            </Typography>
          </Button>
          <Button
            size="large"
            variant="secondary"
            className="flex-1"
            htmlType="button"
            onClick={onClose}
          >
            <Typography
              tag="span"
              className="text-body font-medium text-brand-700"
            >
              {intl("global.labels.cancel")}
            </Typography>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default VerifyPhoneDialog;
