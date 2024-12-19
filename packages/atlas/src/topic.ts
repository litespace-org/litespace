import { Base } from "@/base";
import { ITopic } from "@litespace/types";

export class Topic extends Base {
  async create(
    payload: ITopic.CreateApiPayload
  ): Promise<ITopic.CreateTopicApiResponse> {
    return await this.post("/api/v1/topic/", payload);
  }

  async findTopics(
    params: ITopic.FindTopicsApiQuery
  ): Promise<ITopic.FindTopicsApiResponse> {
    return await this.get(`/api/v1/topic/list`, null, params);
  }

  async updateTopic(
    id: number,
    payload: ITopic.UpdateApiPayload
  ): Promise<ITopic.UpdateTopicApiResponse> {
    return await this.put(`/api/v1/topic/${id}`, payload);
  }

  async deleteTopic(id: number) {
    return await this.del(`/api/v1/topic/${id}`);
  }

  async findUserTopics(): Promise<ITopic.FindUserTopicsApiResponse> {
    return await this.get(`/api/v1/topic/of/user`);
  }

  async addUserTopics(payload: ITopic.AddUserTopicsApiPayload): Promise<void> {
    return await this.post(`/api/v1/topic/of/user`, payload);
  }

  async deleteUserTopics(payload: ITopic.DeleteUserTopicsApiPayload): Promise<void> {
    return await this.del(`/api/v1/topic/of/user`, payload);
  }
}
