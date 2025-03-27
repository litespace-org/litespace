export type ProducePayload = {
  type: RTCSdpType;
  sdp: string;
  userId: number;
};

export type ProduceApiResponse = {
  type: RTCSdpType;
  sdp: string;
};

export type ConsumePayload = {
  type: RTCSdpType;
  sdp: string;
  userId: number;
};

export type ConsumeApiResponse = {
  type: RTCSdpType;
  sdp: string;
};
