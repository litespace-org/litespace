import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@/components/Typography";
import { Loader, LoaderSuccess, LoadingError } from "@/components/Loading";
import { Void } from "@litespace/types";

export type VerificationState = "loading" | "success" | "error";

const EmailVerification: React.FC<{
  state: VerificationState;
  retry: Void;
  resend: Void;
  goDashboard: Void;
}> = ({ state = "loading", retry, resend, goDashboard }) => {
  const intl = useFormatMessage();
  return (
    <div className="grow flex flex-col items-center justify-center gap-10">
      <Typography element="h4" weight={"semibold"} className="text-natural-950">
        {intl("page.verify.email.title")}
      </Typography>
      {state === "loading" ? (
        <Loader size="large" text={intl("page.verify.email.loading")} />
      ) : null}
      {state === "error" ? (
        <LoadingError
          secondAction={{
            label: intl("page.check.email.resend"),
            onClick: resend,
          }}
          retry={retry}
          size="large"
          error={intl("page.verify.email.failure")}
        />
      ) : null}
      {state === "success" ? (
        <LoaderSuccess
          action={{
            label: intl("global.go-dashboard"),
            onClick: goDashboard,
          }}
          text={intl("page.verify.email.success")}
        />
      ) : null}
    </div>
  );
};

export { EmailVerification };
