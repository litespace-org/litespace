import { Base } from "@/base";
import { IMessage, IRoom } from "@litespace/types";

export class Chat extends Base {
  async findRoomMessages(id: number): Promise<IMessage.Self[]> {
    return await this.client
      .get<IMessage.Self[]>(`/api/v1/chat/list/${id}/messages`)
      .then((response) => response.data);
  }
}
