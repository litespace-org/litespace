import { List, InvoicesOverview } from "@/components/Invoices";
import { useUser } from "@litespace/headless/context/user";
import React from "react";

const Invoices: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-4 lg:gap-6 max-w-screen-3xl mx-auto w-full">
      <InvoicesOverview tutorId={user?.id} />
      <List userId={user?.id} />
    </div>
  );
};

export default Invoices;
