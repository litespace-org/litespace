import { ISlot, IUser } from "@litespace/types";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  TagField,
  useModal,
} from "@refinedev/antd";
import {
  Space,
  Table,
  Calendar,
  Divider,
  CalendarProps,
  BadgeProps,
  Badge,
  Button,
  Modal,
  ConfigProvider,
} from "antd";
import { createStyles, useTheme } from "antd-style";
import React, { useCallback, useMemo } from "react";
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

    const discreteSlots = unpackSlots(slots, [], 30);
    const events: EventSourceInput = [];

    console.log({ discreteSlots, slots });

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
        initialView="timeGridWeek"
        events={list}
      />
    </List>
  );
};
