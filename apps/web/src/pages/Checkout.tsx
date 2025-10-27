import React, { useCallback, useMemo } from "react";
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
import Success from "@/components/Checkout/Success";
import { ITransaction } from "@litespace/types";
import Fail from "@/components/Checkout/Fail";
import { Web } from "@litespace/utils/routes";

const Checkout: React.FC = () => {
  const { txTypePayload, tab, setTab, statusCode, slotId } =
    useCheckoutUrlQueryParams();
  const { user } = useUser();
  const navigate = useNavigate();

  if (statusCode === "200") {
    return (
      <div className="flex flex-col lg:flex-row justify-center items-center w-full h-[50vh]">
        <Success
          type={
            slotId !== null
              ? ITransaction.Type.PaidLesson
              : ITransaction.Type.PaidPlan
          }
        />
      </div>
    );
  }

  if (statusCode && statusCode !== "200") {
    return (
      <div className="flex flex-col lg:flex-row justify-center items-center w-full h-[50vh]">
        <Fail
          type={
            slotId !== null
              ? ITransaction.Type.PaidLesson
              : ITransaction.Type.PaidPlan
          }
        />
      </div>
    );
  }

  if (!txTypePayload || !user) {
    navigate(Web.Root);
    return null;
  }

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

  const slotId = useMemo(() => {
    const slotId = params.get("slotId");
    return slotId;
  }, [params]);

  const tab = useMemo((): Tab => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "fawry";
    return tab;
  }, [params]);

  const statusCode = useMemo(() => {
    const param = params.get("statusCode");
    return param;
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

  return { txTypePayload, slotId, tab, setTab, statusCode };
}

export default Checkout;
