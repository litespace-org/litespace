import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Check from "@litespace/assets/CheckCircle";
import CloseCircle from "@litespace/assets/CloseCircle";
import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { IFrameMessage } from "@/constants/iframe";

const CardAdded: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  // ...litespace.org/card-added?statusCode=17002&statusDescription=(F-17002) Card is already exist...
  const params = useParams();

  const statusCode = useMemo(() => {
    return params.statusCode ? Number(params.statusCode) : undefined;
  }, [params.statusCode]);

  useEffect(() => {
    if (!window.top) return navigate(Web.Root);
  }, [navigate]);

  const onContinue = useCallback(() => {
    if (!window.top) return;
    const msg: IFrameMessage = { action: "close" };
    window.parent.postMessage(msg, "*");
  }, []);

  const onTryAgain = useCallback(() => {
    if (!window.top) return;
    const msg: IFrameMessage = { action: "try-again" };
    window.parent.postMessage(msg, "*");
  }, []);

  const onReport = useCallback(() => {
    if (!window.top) return;
    const msg: IFrameMessage = {
      action: "report",
      fawryErrorCode: statusCode || 200,
      fawryErrorDescription: params.statusDescription || "",
    };
    window.parent.postMessage(msg, "*");
  }, [statusCode, params.statusDescription]);

  return (
    <div className="h-full gap-4  flex flex-col items-center justify-center">
      <div
        dir="ltr"
        className="flex flex-row gap-4 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      {!statusCode || statusCode === 200 ? (
        <>
          <div className="flex flex-row gap-2">
            <Check className="w-6 h-6 [&>*]:stroke-brand-700" />
            <Typography tag="p">{intl("card-added.succeeded")}</Typography>
          </div>

          <Button size="large" onClick={onContinue}>
            {intl("card-added.continue-to-payment")}
          </Button>
        </>
      ) : null}

      {statusCode && statusCode !== 200 ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};

export default CardAdded;
