import { Base } from "@/base";
import { IFilter, IMessage, IRoom } from "@litespace/types";

export class Chat extends Base {
  async createRoom(userId: number) {
    await this.client.post(`/api/v1/chat/${userId}`);
  }

  async findRoomMessages(
    id: number,
    pagination?: IFilter.Pagination
  ): Promise<IMessage.FindRoomMessagesApiResponse> {
    return await this.get(`/api/v1/chat/list/${id}/messages`, null, pagination);
  }

  async findRooms(
    userId: number,
    pagination?: IFilter.Pagination
  ): Promise<IRoom.FindUserRoomsApiResponse> {
    return await this.get(
      `/api/v1/chat/list/rooms/${userId}/`,
      null,
      pagination
    );
  }
}
