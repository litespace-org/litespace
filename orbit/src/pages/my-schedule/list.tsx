import { ICall, ISlot } from "@litespace/types";
import { DateField, DeleteButton, EditButton, List } from "@refinedev/antd";
import React, { useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventContentArg, EventInput } from "@fullcalendar/core";
import { unpackSlots } from "@litespace/sol";
import dayjs from "@/lib/dayjs";
import { Flex, Modal, Typography } from "antd";
import { useList } from "@refinedev/core";
import { Resource } from "@/providers/data";

enum EventType {
  Slot = "slot",
  Call = "call",
}

function packEventId(type: EventType, slotId: number): string {
  const id = Math.floor(Math.random() * 1e6);
  return [type, id, slotId].join(":");
}

function unpackEventId(eventId: string): {
  id: string;
  itemId: string;
  type: EventType;
} {
  const [type, id, itemId] = eventId.split(":");
  return { type: type as EventType, id, itemId };
}

export const MyScheduleList: React.FC = () => {
  const [event, setEvent] = useState<EventInput | null>(null);

  const { data, isLoading } = useList<{
    slots: ISlot.Self[];
    calls: ICall.Self[];
  }>({
    resource: Resource.MySchedule,
  });

  const list = useMemo((): EventInput[] => {
    const tuple = data?.data;
    if (!tuple || isLoading) return [];

    const [{ slots, calls }] = tuple;
    const discreteSlots = unpackSlots(slots, [], { window: 40 });
    const events: EventInput[] = [];

    for (const { day, slots: unpackedSlots } of discreteSlots) {
      for (const slot of unpackedSlots) {
        events.push({
          title: slot.title,
          date: dayjs(day).format("YYYY-MM-DD"),
          start: slot.start,
          end: slot.end,
          id: packEventId(EventType.Slot, slot.id),
        });
      }
    }

    for (const call of calls) {
      events.push({
        title: "Private English Lesson with Ahmed",
        date: dayjs(call.start).format("YYYY-MM-DD"),
        start: call.start,
        end: dayjs(call.start).add(call.duration, "minutes").toISOString(),
        id: packEventId(EventType.Call, call.id),
      });
    }

    return events;
  }, [data?.data, isLoading]);

  const reset = useCallback(() => {
    setEvent(null);
  }, []);

  const RenderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { type } = unpackEventId(eventInfo.event._def.publicId);
    const slot = type === EventType.Slot;
    if (eventInfo.view.type === "timeGridWeek")
      return (
        <Flex
          style={{
            backgroundColor: type === EventType.Slot ? "#4096ff" : "#d3adf7",
            height: "100%",
            borderRadius: "6px",
            border: "none",
            flexDirection: "column",
            padding: slot ? "10px" : "0px 10px 0px 10px",
          }}
        >
          <Typography.Paragraph style={{ marginBottom: "2px", color: "white" }}>
            {eventInfo.timeText}
          </Typography.Paragraph>
          {slot ? (
            <Typography.Paragraph style={{ color: "white" }}>
              {eventInfo.event.title}
            </Typography.Paragraph>
          ) : null}
        </Flex>
      );
    return (
      <Flex
        style={{
          backgroundColor: type === EventType.Slot ? "#4096ff" : "#d3adf7",
          height: "100%",
          borderRadius: "6px",
          border: "none",
          paddingLeft: "10px",
        }}
        gap="5px"
      >
        <b>{eventInfo.timeText}</b> - <i>{eventInfo.event.title}</i>
      </Flex>
    );
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
          const id = event.event._def.publicId;
          const selectedEvent = list.find((event) => event.id === id);
          if (!selectedEvent) return;
          return setEvent(selectedEvent);
        }}
        eventContent={RenderEventContent}
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
                  event?.id ? unpackEventId(event.id)?.itemId : undefined
                }
              />
              <DeleteButton
                onSuccess={reset}
                recordItemId={
                  event?.id ? unpackEventId(event.id)?.itemId : undefined
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
