import { Timeline, TimelineItem } from "@litespace/luna";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { Hash } from "react-feather";
import Invoice from "./Invoice";

const List: React.FC<{ invoices: IInvoice.Self[]; onUpdate?: () => void }> = ({
  invoices,
  onUpdate,
}) => {
  const timeline = useMemo((): TimelineItem[] => {
    return invoices.map((invoice) => ({
      id: invoice.id,
      children: <Invoice invoice={invoice} onUpdate={onUpdate} />,
      icon: <Hash />,
    }));
  }, [invoices, onUpdate]);

  return (
    <div className="w-full">
      <Timeline timeline={timeline} />
    </div>
  );
};

export default List;
