import React, { useEffect, useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { Replace } from "@litespace/types";
import { useNavigate, useParams } from "react-router-dom";
import { isInteger } from "lodash";
import { useLogger } from "@litespace/headless/logger";
import { isValidPlanPeriodLiteral } from "@litespace/utils";
import { useUserContext } from "@litespace/headless/context/user";
import Tabs from "@/components/Checkout/Tabs";

type Params = Replace<UrlParamsOf<Web.Checkout>, "planId" | "period", string>;

const Checkout: React.FC = () => {
  const intl = useFormatMessage();
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const planId = useMemo(() => {
    const planId = Number(params.planId);
    if (isInteger(planId)) return planId;
    logger.error(`Invalid plan id: ${params.planId}`);
    return null;
  }, [logger, params.planId]);

  const period = useMemo(() => {
    const period = params.period;
    if (period && isValidPlanPeriodLiteral(period)) return period;
    logger.error(`Invalid plan period: ${params.period}`);
    return null;
  }, [logger, params.period]);

  useEffect(() => {
    if (!planId || !period || !user?.id) return navigate(Web.Root);
  }, [navigate, period, planId, user?.id]);

  if (!planId || !period || !user) return null;

  return (
    <div className="h-full gap-8 flex flex-col items-center mt-[15vh]">
      <div
        dir="ltr"
        className="flex flex-row gap-4 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>
      <Tabs planId={planId} period={period} phone={user.phone} />
    </div>
  );
};

export default Checkout;
