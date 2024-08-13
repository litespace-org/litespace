import { Base } from "@/base";
import { IMessage, IRoom } from "@litespace/types";

export class Chat extends Base {
  async findRoomMessages(id: number): Promise<IMessage.Self[]> {
    return await this.client
      .get<IMessage.Self[]>(`/api/v1/chat/list/${id}/messages`)
      .then((response) => response.data);
  }

  async findRooms(userId: number): Promise<IRoom.RoomMap> {
    return await this.client
      .get<IRoom.RoomMap>(`/api/v1/chat/list/rooms/${userId}/`)
      .then((response) => response.data);
  }
}
