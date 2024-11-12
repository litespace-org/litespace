export type RegisterPeerIdApiPayload = {
  peer: string;
  call?: number;
};

export type DeletePeerIdApiQurey = {
  call?: number;
};

export enum PeerType {
  Tutor = "tutor",
  Ghost = "ghost",
}

export type FindPeerIdApiQuery =
  | {
      type: PeerType.Tutor;
      tutor: number;
    }
  | {
      type: PeerType.Ghost;
      call: number;
    };

export type FindPeerIdApiResponse = {
  peer: string | null;
};
