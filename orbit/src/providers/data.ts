import { atlas, backendUrl } from "@/lib/atlas";
import { ISlot, IUser, IZoomAccount, as } from "@litespace/types";
import { DataProvider, GetListParams } from "@refinedev/core";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

export enum Resource {
  UserTypes = "user-types",
  Users = "users",
  MySchedule = "my-schedule",
  ZoomAccounts = "zoom-accounts",
}

const empty = { data: null };

export const dataProvider: DataProvider = {
  async getOne({ resource, id }) {
    if (resource === Resource.Users) {
      const user = await atlas.user.findById(id);
      return { data: as.casted(user) };
    }

    if (resource === Resource.MySchedule) {
      const slot = await atlas.slot.findById(as.int(id));
      return { data: as.casted(slot) };
    }

    if (resource === Resource.ZoomAccounts) {
      const account = await atlas.zoom.findAccountById(as.int(id));
      return { data: as.casted(account) };
    }

    throw new Error("Not implemented");
  },
  async update({ id, resource, variables }) {
    console.log({ variables });
    if (resource === Resource.Users) {
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

    if (resource === Resource.ZoomAccounts) {
      const { uAccountId, uClientId, uClientSecret } = as.casted<{
        uAccountId?: string;
        uClientId?: string;
        uClientSecret?: string;
      }>(variables);

      await atlas.zoom.updateAccount(as.int(id), {
        accountId: uAccountId,
        clientId: uClientId,
        clientSecret: uClientSecret,
      });

      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  create: async ({ resource, variables, meta }) => {
    if (resource === "users") {
      await atlas.user.create(as.casted(variables));
      return as.casted(empty);
    }
    if (resource === Resource.MySchedule) {
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
      return as.casted(empty);
    }

    if (resource === Resource.ZoomAccounts) {
      const payload = as.casted<IZoomAccount.CreatePayload>(variables);
      const account = await atlas.zoom.createAccount(payload);
      return { data: as.casted(account) };
    }

    throw new Error("Not implemented");
  },
  deleteOne: async ({ resource, id }) => {
    if (resource === Resource.MySchedule) {
      await atlas.slot.delete(as.int(id));
      return as.casted(empty);
    }

    if (resource === Resource.ZoomAccounts) {
      await atlas.zoom.deleteAccount(as.int(id));
      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  getList: async ({ resource }: GetListParams) => {
    console.log({ resource });

    if (resource === Resource.UserTypes) {
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
      const slots = await atlas.slot.findMySlots();
      const calls = await atlas.call.findMyCalls();

      return {
        data: as.casted([{ slots, calls }]),
        total: 0,
      };
    }

    if (resource === Resource.Users) {
      const list = await atlas.user.list();
      return { data: as.any(list), total: list.length };
    }

    if (resource === Resource.ZoomAccounts) {
      const list = await atlas.zoom.findAllAccounts();
      return { data: as.any(list), total: list.length };
    }

    throw new Error("Not implemented");
  },
  getApiUrl: () => backendUrl,
};
