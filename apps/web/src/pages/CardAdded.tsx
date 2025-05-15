import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Check from "@litespace/assets/CheckCircle";
import CloseCircle from "@litespace/assets/CloseCircle";
import React, { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { useSearchParams } from "react-router-dom";
import { IframeMessage } from "@/constants/iframe";
import { Void } from "@litespace/types";

const CardAdded: React.FC = () => {
  const intl = useFormatMessage();
  const [params] = useSearchParams();

  const { statusCode, statusDescription } = useMemo(() => {
    const statusCode = Number(params.get("statusCode") || 200);
    const statusDescription = params.get("statusDescription ") || "";

    return {
      statusCode: isNaN(statusCode) ? 200 : statusCode,
      statusDescription,
    };
  }, [params]);

  const onContinue = useCallback(() => {
    if (!window.top) return;
    const msg: IframeMessage = { action: "close" };
    window.parent.postMessage(msg, "*");
  }, []);

  const onTryAgain = useCallback(() => {
    if (!window.top) return;
    const msg: IframeMessage = { action: "try-again" };
    window.parent.postMessage(msg, "*");
  }, []);

  const onReport = useCallback(() => {
    if (!window.top) return;
    const msg: IframeMessage = {
      action: "report",
      fawryErrorCode: statusCode,
      fawryErrorDescription: statusDescription,
    };
    window.parent.postMessage(msg, "*");
  }, [statusCode, statusDescription]);

  return (
    <div className="h-full gap-4 flex flex-col items-center justify-center">
      <div
        dir="ltr"
        className="flex flex-row gap-4 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-500 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      {statusCode === 200 ? (
        <Success onContinue={onContinue} />
      ) : (
        <Failed onTryAgain={onTryAgain} onReport={onReport} />
      )}
    </div>
  );
};

const Success: React.FC<{ onContinue: Void }> = ({ onContinue }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <Check className="w-6 h-6 [&>*]:stroke-brand-700" />
        <Typography tag="p">{intl("card-added.succeeded")}</Typography>
      </div>

      <Button size="large" onClick={onContinue}>
        {intl("card-added.continue-to-payment")}
      </Button>
    </div>
  );
};

const Failed: React.FC<{
  onTryAgain: Void;
  onReport: Void;
}> = ({ onTryAgain, onReport }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-row gap-2">
        <CloseCircle className="w-6 h-6" />
        <Typography tag="p">{intl("card-added.failed")}</Typography>
      </div>

      <div className="flex gap-4 items-center">
        <Button size="large" variant="primary" onClick={onTryAgain}>
          {intl("labels.try-again")}
        </Button>
        <Button size="large" variant="secondary" onClick={onReport}>
          {intl("labels.report")}
        </Button>
      </div>
    </div>
  );
};

export default CardAdded;
