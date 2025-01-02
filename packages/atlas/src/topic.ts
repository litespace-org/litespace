import { Base } from "@/base";
import { ITopic } from "@litespace/types";

export class Topic extends Base {
  async create(
    payload: ITopic.CreateApiPayload
  ): Promise<ITopic.CreateTopicApiResponse> {
    return await this.post({ route: "/api/v1/topic/", payload });
  }

  async findTopics(
    params: ITopic.FindTopicsApiQuery
  ): Promise<ITopic.FindTopicsApiResponse> {
    return await this.get({ route: `/api/v1/topic/list`, params });
  }

  async updateTopic(
    id: number,
    payload: ITopic.UpdateApiPayload
  ): Promise<ITopic.UpdateTopicApiResponse> {
    return await this.put({ route: `/api/v1/topic/${id}`, payload });
  }

  async deleteTopic(id: number) {
    return await this.del({ route: `/api/v1/topic/${id}` });
  }

  async findUserTopics(): Promise<ITopic.FindUserTopicsApiResponse> {
    return await this.get({ route: `/api/v1/topic/of/user` });
  }

  async addUserTopics(payload: ITopic.AddUserTopicsApiPayload): Promise<void> {
    return await this.post({ route: `/api/v1/topic/of/user`, payload });
  }

  async deleteUserTopics(
    payload: ITopic.DeleteUserTopicsApiPayload
  ): Promise<void> {
    return await this.del({ route: `/api/v1/topic/of/user`, payload });
  }

  async replaceUserTopics(
    payload: ITopic.ReplaceUserTopicsApiPayload
  ): Promise<void> {
    return await this.patch({ route: `/api/v1/topic/of/user`, payload });
  }
}
