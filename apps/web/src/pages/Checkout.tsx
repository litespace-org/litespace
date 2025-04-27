import React, { useEffect, useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Payment from "@/components/Checkout/Payment";
import Plan from "@/components/Checkout/Plan";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { Replace } from "@litespace/types";
import { useNavigate, useParams } from "react-router-dom";
import { isInteger } from "lodash";
import { useLogger } from "@litespace/headless/logger";
import { isValidPlanPeriodLiteral } from "@litespace/utils";
import { useUserContext } from "@litespace/headless/context/user";

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
    <div className="h-full gap-6 flex flex-col items-center mt-[15vh]">
      <div
        dir="ltr"
        className="flex flex-row gap-4 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 w-full px-10">
        <div className="w-full md:flex-1 flex flex-col max-w-[464px]">
          <Payment planId={planId} period={period} phone={user.phone} />
        </div>
        <div className="w-full md:flex-1 flex flex-col max-w-[530px]">
          <Plan />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
