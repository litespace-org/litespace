import { atlas, backendUrl } from "@/lib/atlas";
import { IUser, as } from "@litespace/types";
import { DataProvider, GetListParams } from "@refinedev/core";
import zod from "zod";
import dayjs, { Dayjs } from "dayjs";

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
    if (resource === "users") {
      await atlas.user.create(as.casted(variables));
      return { data: as.any(null) };
    }

    console.log({ resource, variables, meta });
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

    if (resource === "users") {
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
