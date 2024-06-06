import { ISlot } from "@litespace/types";
import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { unpackSlots } from "@litespace/atlas";
import dayjs from "@/lib/dayjs";
import { Flex, Modal } from "antd";

export const MyScheduleList: React.FC = () => {
  const [event, setEvent] = useState<EventInput | null>(null);

  const { tableQueryResult } = useTable<ISlot.Self>({
    syncWithLocation: true,
  });

  const list = useMemo((): EventInput[] => {
    const slots = tableQueryResult.data?.data;
    if (!slots) return [];

    const discreteSlots = unpackSlots(slots, [], 40);
    const events: EventInput[] = [];

    for (const { day, slots: unpackedSlots } of discreteSlots) {
      for (const slot of unpackedSlots) {
        events.push({
          title: slot.title,
          date: dayjs(day).format("YYYY-MM-DD"),
          start: slot.start,
          end: slot.end,
          id: Math.floor(Math.random() * 1e9).toString(),
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
        allDaySlot={false}
        eventClick={(event) => {
          console.log(event);
          const id = event.event._def.publicId;
          const selectedEvent = list.find((event) => event.id === id);
          if (!selectedEvent) return;
          return setEvent(selectedEvent);
        }}
      />

      <Modal
        open={event !== null}
        onClose={() => setEvent(null)}
        onCancel={() => setEvent(null)}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Flex gap="10px" justify="end">
            <CancelBtn />
            <EditButton />
            <DeleteButton />
          </Flex>
        )}
      >
        kk
      </Modal>
    </List>
  );
};
