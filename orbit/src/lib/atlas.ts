import zod from "zod";
import { Backend } from "@litespace/types";
import { Atlas, backendUrls } from "@litespace/atlas";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export const backendUrl = backendUrls[backend];

export const atlas = new Atlas(backend);
