import { InvoicesOverview } from "@/components/Invoices";
import { useUserContext } from "@litespace/headless/context/user";
import { Table as InvoicesTable } from "@/components/Invoices";
import React from "react";

const Invoices: React.FC = () => {
  const { user } = useUserContext();

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-4 lg:gap-6 max-w-screen-3xl mx-auto w-full">
      <InvoicesOverview tutorId={user?.id} />
      <InvoicesTable />
    </div>
  );
};

export default Invoices;
