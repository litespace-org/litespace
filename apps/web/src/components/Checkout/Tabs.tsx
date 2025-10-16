import React from "react";
import { ITransaction, Void } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import TxTypeDetails from "@/components/Checkout/TxTypeDetails";
import Card from "@/components/Checkout/Forms/Card";
import EWallet from "@/components/Checkout/Forms/EWallet";
import Fawry from "@/components/Checkout/Forms/Fawry";
import { Tab, TxTypeData, TxTypeDataQuery } from "@/components/Checkout/types";

const TapsContainer: React.FC<{
  userId: number;
  txTypeDataQuery: TxTypeDataQuery;
  phone: string | null;
  sync: Void;
  syncing: boolean;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
  tab: Tab;
  setTab(tab: Tab): void;
}> = ({
  userId,
  txTypeDataQuery,
  phone,
  syncing,
  sync,
  transactionId,
  transactionStatus,
  tab,
  setTab,
}) => {
  return (
    <div>
      <Header tab={tab} setTab={setTab} />
      <Body
        userId={userId}
        tab={tab}
        phone={phone}
        syncing={syncing}
        sync={sync}
        txTypeDataQuery={txTypeDataQuery}
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
    <div className="flex items-center justify-center md:w-fit mx-auto mb-4 md:mb-10">
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
  txTypeDataQuery: TxTypeDataQuery;
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
  txTypeDataQuery,
  transactionId,
  transactionStatus,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-4 lg:gap-10 lg:min-w-[950px] ">
        <PaymentPannel
          userId={userId}
          tab={tab}
          phone={phone}
          syncing={syncing}
          sync={sync}
          txTypeData={txTypeDataQuery}
          transactionId={transactionId}
          transactionStatus={transactionStatus}
        />
        <TxTypeDetailsPannel txTypeDataQuery={txTypeDataQuery} />
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

const TxTypeDetailsPannel: React.FC<{ txTypeDataQuery: TxTypeDataQuery }> = ({
  txTypeDataQuery,
}) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      <TxTypeDetails txTypeDataQuery={txTypeDataQuery} />
    </div>
  );
};

export default TapsContainer;
