import { useCalendarEvents } from "@/hooks/event";
import { Calendar } from "@litespace/luna/components/Calendar";
import { Dialog } from "@litespace/luna/components/Dialog";
import { IRule } from "@litespace/types";
import cn from "classnames";
import React, { useMemo } from "react";

const VisualizeRule: React.FC<{
  rule: IRule.Self;
  open?: boolean;
  close: () => void;
}> = ({ rule, open, close }) => {
  const { events } = useCalendarEvents(useMemo(() => ({ rule }), [rule]));
  return (
    <Dialog title={rule.title} open={open} close={close}>
      <div className={cn("max-h-[70vh] overflow-hidden text-foreground ")}>
        <Calendar
          events={events}
          className="h-[60vh]"
          start={rule.start}
          min={rule.start}
          max={rule.end}
        />
      </div>
    </Dialog>
  );
};

export default VisualizeRule;
