import List from "@/components/Invoices/List";
import Stats from "@/components/Invoices/Stats";
import React from "react";

const Invoices: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full p-6 flex flex-col gap-6">
      <Stats />
      <List />
    </div>
  );
};

export default Invoices;
