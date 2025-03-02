export type LogLine = string;

export type LogLineData = {
  ip: string; // requester ip address: 123.123.123.123.
  type: string; // request type: GET, POST, etc.
  endpoint: string; // request endpoint: /, /home, etc.
};

export type Connection = "normal" | "fishy" | "uncertain";

export type Config = {
  access_log: string;
  bots: string;
  trained: string;
  uncertains: string;
  threshold: number;
  strikes: number;
};
