import { IUser } from "@litespace/types";
import { Participant, Track, TrackPublication } from "livekit-client";

export type TrackReference = {
  participant: Participant;
  publication: TrackPublication;
  source: Track.Source;
};

export type LocalMember = IUser.Self;

export type RemoteMember = {
  id: number;
  name: string | null;
  role: IUser.Role;
  image: string | null;
};
