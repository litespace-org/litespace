import zod from "zod";
import { Backend } from "@litespace/types";
import { Atlas, backends } from "@litespace/atlas";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export const backendUrl = backends.main[backend];

export const atlas = new Atlas(backend);
