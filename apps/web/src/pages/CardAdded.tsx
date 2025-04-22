import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Check from "@litespace/assets/CheckCircle";
import React, { useCallback, useEffect } from "react";
import { Button } from "@litespace/ui/Button";
import { useNavigate } from "react-router-dom";
import { Web } from "@litespace/utils/routes";

const CardAdded: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.top) return navigate(Web.Root);
  }, [navigate]);

  const onContinue = useCallback(() => {
    if (!window.top) return;
    window.parent.postMessage("card-added", "*");
  }, []);

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

      <div className="flex flex-row gap-2">
        <Check className="w-6 h-6 [&>*]:stroke-brand-700" />
        <Typography tag="p">
          {intl("card-added.card-added-successfully")}
        </Typography>
      </div>

      <Button size="large" onClick={onContinue}>
        {intl("card-added.continue-to-payment")}
      </Button>
    </div>
  );
};

export default CardAdded;
