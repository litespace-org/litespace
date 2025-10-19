import React, { useCallback, useEffect, useMemo } from "react";
import { Web } from "@litespace/utils/routes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@litespace/headless/context/user";
import Content from "@/components/Checkout/Content";
import {
  asSearchUrlParams,
  asTxTypePayload,
  isValidTab,
} from "@/components/Checkout/utils";
import { Tab } from "@/components/Checkout/types";
import { track } from "@/lib/analytics";

const Checkout: React.FC = () => {
  const { txTypePayload, tab, setTab } = useCheckoutUrlQueryParams();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!txTypePayload || !user?.id) return navigate(Web.Root);
  }, [navigate, txTypePayload, user?.id]);

  if (!txTypePayload || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <Content
        txTypePayload={txTypePayload}
        userPhone={user.phone}
        userId={user.id}
        tab={tab}
        setTab={setTab}
      />
    </div>
  );
};

function useCheckoutUrlQueryParams() {
  const [params, setParams] = useSearchParams();
  const txTypePayload = useMemo(() => asTxTypePayload(params), [params]);

  const tab = useMemo((): Tab => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "card";
    return tab;
  }, [params]);

  const setTab = useCallback(
    (tab: Tab) => {
      track("select_payment_method", "checkout", tab);
      setParams({
        ...(txTypePayload ? asSearchUrlParams(txTypePayload) : {}),
        tab,
      });
    },
    [setParams, txTypePayload]
  );

  return { txTypePayload, tab, setTab };
}

export default Checkout;
