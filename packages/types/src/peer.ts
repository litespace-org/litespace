export type RegisterPeerIdApiPayload = {
  peer: string;
  session?: string;
};

export type DeletePeerIdApiQurey = {
  session?: string;
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
      session: string; // has to be string so zod check can pass
    };

export type FindPeerIdApiResponse = {
  peer: string | null;
};
