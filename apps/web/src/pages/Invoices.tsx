import InvoicesOverview from "@/components/Invoices/InvoicesOverview";
import { useUserContext } from "@litespace/headless/context/user";
import React from "react";

const Invoices: React.FC = () => {
  const { user } = useUserContext();

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <InvoicesOverview tutorId={user?.id} />
    </div>
  );
};

export default Invoices;
