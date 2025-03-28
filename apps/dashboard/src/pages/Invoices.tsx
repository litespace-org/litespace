// import Content from "@/components/Invoices/Content";
import React from "react";
import ProfitsOverview from "@/components/Invoices/ProfitsOverview";
import InvoicesTable from "@/components/Invoices/InvoicesTable";

const Invoices: React.FC = () => {
  return (
    <div className="w-full p-6 mx-auto max-w-screen-2xl flex flex-col gap-6">
      {/* <Content /> */}
      <ProfitsOverview />
      <InvoicesTable />
    </div>
  );
};

export default Invoices;
