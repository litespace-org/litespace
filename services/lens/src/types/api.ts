import { Cluster } from "puppeteer-cluster";

export type ApiContext = {
  cluster: Cluster<{ query: string }, string[]>;
};
