import { atlas, backendUrl } from "@/lib/atlas";
import { ISlot, IUser, as } from "@litespace/types";
import { DataProvider, GetListParams } from "@refinedev/core";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

export enum Resource {
  Users = "users",
  MySchedule = "my-schedule",
}

export const dataProvider: DataProvider = {
  async getOne({ resource, id }) {
    if (resource === "users") {
      const user = await atlas.user.findById(id);
      return { data: as.casted(user) };
    }
    throw new Error("Not implemented");
  },
  async update({ id, resource, variables }) {
    console.log({ variables });
    if (resource === "users") {
      const { uName, uEmail, uPassword, uAvatar, uBithday, uGender, uType } =
        as.casted<
          Partial<{
            uName: string;
            uEmail: string;
            uPassword: string;
            uAvatar: string;
            uBithday: Dayjs;
            uGender: IUser.Gender;
            uType: IUser.Type;
          }>
        >(variables);
      await atlas.user.update({
        name: uName,
        email: uEmail,
        password: uPassword,
        avatar: uAvatar,
        birthday: uBithday ? uBithday.format("YYYY-MM-DD") : undefined,
        gender: uGender,
        type: uType,
        id: as.int(id),
      });
      return { data: as.casted(null) };
    }

    throw new Error("Not implemented");
  },
  create: async ({ resource, variables, meta }) => {
    const emtpy = { data: null };

    if (resource === "users") {
      await atlas.user.create(as.casted(variables));
      return as.casted(emtpy);
    } else if (resource === Resource.MySchedule) {
      const {
        date: [startDate, endDate],
        endTime,
        startTime,
        repeat,
        title,
        weekday,
      } = as.casted<{
        date: [Dayjs, Dayjs?];
        endTime: Dayjs;
        startTime: Dayjs;
        repeat: ISlot.Repeat;
        title: string;
        weekday: number;
      }>(variables);

      console.log({
        title,
        time: {
          start: dayjs(startTime, "Africa/Cairo").utc().format("HH:mm:00"),
          end: dayjs(endTime, "Africa/Cairo").utc().format("HH:mm:00"),
        },
        date: {
          start: startDate.tz("Africa/Cairo").format("YYYY-MM-DD"),
          end: endDate?.tz("Africa/Cairo").format("YYYY-MM-DD"),
        },
        repeat,
        weekday,
      });

      await atlas.slot.create({
        title,
        time: {
          start: dayjs(startTime, "Africa/Cairo").utc().format("HH:mm:00"),
          end: dayjs(endTime, "Africa/Cairo").utc().format("HH:mm:00"),
        },
        date: {
          start: startDate.tz("Africa/Cairo").format("YYYY-MM-DD"),
          end: endDate?.tz("Africa/Cairo").format("YYYY-MM-DD"),
        },
        repeat,
        weekday,
      });
      return as.casted(emtpy);
    }

    throw new Error("Not implemented");
  },
  deleteOne: async () => {
    throw new Error("Not implemented");
  },
  getList: async ({ resource }: GetListParams) => {
    console.log({ resource });

    if (resource === "user_types") {
      const list = [
        { label: "Super Admin", value: "super_admin" },
        { label: "Examiner", value: "examiner" },
      ];

      return {
        data: as.any(list),
        total: list.length,
      };
    }

    if (resource === Resource.MySchedule) {
      const list = await atlas.slot.findMySlots();
      return {
        data: as.casted(list),
        total: list.length,
      };
    }

    if (resource === Resource.Users) {
      const list = await atlas.user.list();
      return {
        data: as.any(list),
        total: list.length,
      };
    }
    throw new Error("Not implemented");
  },
  getApiUrl: () => backendUrl,
};
