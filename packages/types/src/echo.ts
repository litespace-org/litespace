type SessionDescription = {
  type: RTCSdpType;
  sdp: string;
};

export type ProducePayload = {
  sessionDescription: SessionDescription;
  peerId: number;
};

export type ProduceApiResponse = SessionDescription;

export type ConsumePayload = {
  sessionDescription: SessionDescription;
  peerId: number;
  producerPeerId: number;
};

export type ConsumeApiResponse = SessionDescription;
