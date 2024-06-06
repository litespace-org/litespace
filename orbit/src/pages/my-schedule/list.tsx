import { ISlot } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  useTable,
} from "@refinedev/antd";
import React, { useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { unpackSlots } from "@litespace/atlas";
import dayjs from "@/lib/dayjs";
import { Flex, Modal, Typography } from "antd";

function packEventId(slotId: number): string {
  const id = Math.floor(Math.random() * 1e6);
  return [id, slotId].join(":");
}

function unpackEventId(eventId: string): { id: string; slotId: string } | null {
  const [id, slotId] = eventId.split(":");
  return { id, slotId };
}

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
          id: packEventId(slot.id),
        });
      }
    }

    return events;
  }, [tableQueryResult.data?.data]);

  const reset = useCallback(() => {
    setEvent(null);
  }, []);

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
        onClose={reset}
        onCancel={reset}
        closable={false}
        title={
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {event?.title}
          </Typography.Title>
        }
        footer={(_, { CancelBtn }) => {
          return (
            <Flex gap="10px" justify="end">
              <CancelBtn />
              <EditButton
                recordItemId={
                  event?.id ? unpackEventId(event.id)?.slotId : undefined
                }
              />
              <DeleteButton
                onSuccess={reset}
                recordItemId={
                  event?.id ? unpackEventId(event.id)?.slotId : undefined
                }
              />
            </Flex>
          );
        }}
      >
        <Flex align="center" gap="10px">
          <Typography.Text strong style={{ fontSize: "16px" }}>
            Date :
          </Typography.Text>

          {event?.date ? (
            <DateField value={event.date.toString()} format="LL" />
          ) : null}
        </Flex>

        <Flex align="center" gap="10px">
          <Typography.Text strong style={{ fontSize: "16px" }}>
            From :
          </Typography.Text>

          {event?.start ? (
            <DateField value={event.start.toString()} format="h:mm:ss A" />
          ) : null}
        </Flex>

        <Flex align="center" gap="10px">
          <Typography.Text strong style={{ fontSize: "16px" }}>
            To :
          </Typography.Text>

          {event?.end ? (
            <DateField value={event.end.toString()} format="h:mm:ss A" />
          ) : null}
        </Flex>
      </Modal>
    </List>
  );
};
