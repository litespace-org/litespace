import { useCalendarEvents } from "@/hooks/event";
import { Calendar, Dialog } from "@litespace/luna";
import { IRule } from "@litespace/types";
import cn from "classnames";
import React, { useMemo } from "react";

const VisualizeRule: React.FC<{
  rule: IRule.Self;
  open?: boolean;
  close: () => void;
}> = ({ rule, open, close }) => {
  const payload = useMemo(() => ({ rule }), [rule]);
  const { events } = useCalendarEvents(payload);
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
