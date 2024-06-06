import { ISlot } from "@litespace/types";
import { List, useTable } from "@refinedev/antd";
import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventSourceInput } from "@fullcalendar/core";
import { unpackSlots } from "@litespace/atlas";
import dayjs from "@/lib/dayjs";

export const MyScheduleList: React.FC = () => {
  const { tableProps, tableQueryResult } = useTable<ISlot.Self>({
    syncWithLocation: true,
  });

  const list = useMemo((): EventSourceInput => {
    const slots = tableQueryResult.data?.data;
    if (!slots) return [];

    const discreteSlots = unpackSlots(slots, [], 40);
    const events: EventSourceInput = [];

    for (const { day, slots: unpackedSlots } of discreteSlots) {
      for (const slot of unpackedSlots) {
        events.push({
          title: slot.title,
          date: dayjs(day).format("YYYY-MM-DD"),
          start: slot.start,
          end: slot.end,
        });
      }
    }

    return events;
  }, [tableQueryResult.data?.data]);

  return (
    <List>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin]}
        headerToolbar={{
          right: "prev,next today",
          center: "title",
          left: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        initialView="timeGridWeek"
        events={list}
      />
    </List>
  );
};
