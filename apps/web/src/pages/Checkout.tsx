import React, { useEffect, useMemo } from "react";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { Replace } from "@litespace/types";
import { useNavigate, useParams } from "react-router-dom";
import { isInteger } from "lodash";
import { useLogger } from "@litespace/headless/logger";
import { isValidPlanPeriodLiteral } from "@litespace/utils";
import { useUserContext } from "@litespace/headless/context/user";
import Content from "@/components/Checkout/Content";

type Params = Replace<UrlParamsOf<Web.Checkout>, "planId" | "period", string>;

const Checkout: React.FC = () => {
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
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <Content planId={planId} period={period} userPhone={user.phone} />
    </div>
  );
};

export default Checkout;
