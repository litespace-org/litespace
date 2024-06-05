import { backendUrl } from "@/lib/atlas";
import { as } from "@litespace/types";
import { DataProvider } from "@refinedev/core";

export const dataProvider: DataProvider = {
  async getOne(params) {
    console.log({ params });
    const data = { id: 1 };
    return { data: as.any(data) };
  },
  async update(params) {
    console.log(params);
    const data = {};
    return { data: as.any(data) };
  },
  create: async () => {
    throw new Error("Not implemented");
  },
  deleteOne: async () => {
    throw new Error("Not implemented");
  },
  getList: async (params) => {
    console.log({ params });
    throw new Error("Not implemented");
  },
  getApiUrl: () => backendUrl,
};
