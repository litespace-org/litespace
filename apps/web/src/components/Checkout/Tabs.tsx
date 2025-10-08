import React, { useMemo } from "react";
import { ITransaction, Void } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useSearchParams } from "react-router-dom";
import TxTypeDetails from "@/components/Checkout/TxTypeDetails";
import Card from "@/components/Checkout/Forms/Card";
import EWallet from "@/components/Checkout/Forms/EWallet";
import Fawry from "@/components/Checkout/Forms/Fawry";
import { TxTypeData } from "@/components/Checkout/types";

type Tab = "card" | "ewallet" | "fawry";

function isValidTab(tab: string): tab is Tab {
  return tab === "card" || tab === "ewallet" || tab === "fawry";
}

const TapsContainer: React.FC<{
  userId: number;
  txTypeData: TxTypeData;
  phone: string | null;
  sync: Void;
  syncing: boolean;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  userId,
  txTypeData,
  phone,
  syncing,
  sync,
  transactionId,
  transactionStatus,
}) => {
  const [params, setParams] = useSearchParams({});

  const tab = useMemo((): Tab => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "card";
    return tab;
  }, [params]);

  return (
    <div>
      <Header tab={tab} setTab={(tab) => setParams({ tab })} />
      <Body
        userId={userId}
        tab={tab}
        phone={phone}
        syncing={syncing}
        sync={sync}
        txTypeData={txTypeData}
        transactionId={transactionId}
        transactionStatus={transactionStatus}
      />
    </div>
  );
};

const Header: React.FC<{ tab: Tab; setTab(tab: Tab): void }> = ({
  tab,
  setTab,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-center md:w-fit mx-auto mb-4 md:mb-10 lg:mb-8">
      <Tabs<Tab>
        tab={tab}
        setTab={setTab}
        tabs={[
          {
            id: "card",
            label: intl("checkout.tabs.paywithcard"),
          },
          {
            id: "ewallet",
            label: intl("checkout.tabs.ewallet"),
          },
          {
            id: "fawry",
            label: intl("checkout.tabs.fawry"),
          },
        ]}
      />
    </div>
  );
};

const Body: React.FC<{
  userId: number;
  tab: Tab;
  txTypeData: TxTypeData;
  phone: string | null;
  syncing: boolean;
  sync: Void;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  userId,
  tab,
  phone,
  syncing,
  sync,
  txTypeData,
  transactionId,
  transactionStatus,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-4 lg:gap-10 lg:min-w-[1004px] ">
        <PaymentPannel
          userId={userId}
          tab={tab}
          phone={phone}
          syncing={syncing}
          sync={sync}
          txTypeData={txTypeData}
          transactionId={transactionId}
          transactionStatus={transactionStatus}
        />
        <TxTypeDetailsPannel txTypeData={txTypeData} />
      </div>
    </div>
  );
};

const PaymentPannel: React.FC<{
  tab: Tab;
  userId: number;
  phone: string | null;
  txTypeData: TxTypeData;
  syncing: boolean;
  sync: Void;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  tab,
  userId,
  phone,
  syncing,
  sync,
  txTypeData,
  transactionId,
  transactionStatus,
}) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      {tab === "card" ? (
        <Card
          transactionId={transactionId}
          transactionStatus={transactionStatus}
          txTypeData={txTypeData}
          userId={userId}
          phone={phone}
        />
      ) : null}

      {tab === "ewallet" ? (
        <EWallet
          phone={phone}
          txTypeData={txTypeData}
          syncing={syncing}
          sync={sync}
        />
      ) : null}

      {tab === "fawry" ? (
        <Fawry
          txTypeData={txTypeData}
          phone={phone}
          syncing={syncing}
          sync={sync}
        />
      ) : null}
    </div>
  );
};

const TxTypeDetailsPannel: React.FC<{ txTypeData: TxTypeData }> = ({
  txTypeData,
}) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      <TxTypeDetails txTypeData={txTypeData} />
    </div>
  );
};

export default TapsContainer;
