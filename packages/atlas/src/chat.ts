import { Base } from "@/base";
import { IFilter, IMessage, IRoom } from "@litespace/types";

export class Chat extends Base {
  async createRoom(userId: number): Promise<IRoom.CreateRoomApiResponse> {
    return await this.post({ route: `/api/v1/chat/${userId}` });
  }

  async findRoomMessages(
    id: number,
    pagination?: IFilter.Pagination
  ): Promise<IMessage.FindRoomMessagesApiResponse> {
    return await this.get({
      route: `/api/v1/chat/list/${id}/messages`, 
      params: pagination,
    });
  }

  async findRooms(
    userId: number,
    query?: IRoom.FindUserRoomsApiQuery
  ): Promise<IRoom.FindUserRoomsApiResponse> {
    return await this.get({
      route: `/api/v1/chat/list/rooms/${userId}/`, 
      params: query,
    });
  }

  async findRoomByMembers(
    members: number[]
  ): Promise<IRoom.FindRoomByMembersApiResponse> {
    return await this.get({
      route:"/api/v1/chat/room/by/members", 
      params: { members },
    });
  }

  async findRoomMembers(
    room: number
  ): Promise<IRoom.FindRoomMembersApiResponse> {
    return await this.get({ route: `/api/v1/chat/room/members/${room}` });
  }

  async updateRoom(
    room: number,
    payload: IRoom.UpdateRoomApiPayload
  ): Promise<IRoom.Member> {
    return await this.put({ 
      route: `/api/v1/chat/room/${room}`, 
      payload, 
    });
  }
}
