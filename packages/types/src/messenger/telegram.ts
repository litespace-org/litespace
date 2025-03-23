import { EntityLike } from "telegram/define";

export type SendMessagePayload = {
  entity: EntityLike;
  message: string;
};
