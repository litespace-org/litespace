import { Base } from "@/base";
import { IRule } from "@litespace/types";

export class Rule extends Base {
  async create(payload: IRule.CreateApiPayload): Promise<IRule.Self> {
    return await this.post(`/api/v1/rule/`, payload);
  }

  /**
   * @param id user id (interviewer or tutor)
   */
  async findUserRules(id: number): Promise<IRule.Self[]> {
    return await this.get(`/api/v1/rule/list/${id}`);
  }

  /**
   * @param id user id (interviewer or tutor)
   * @param after  utc after time (get rules after this time)
   * @param before utc before time (get rules before this time)
   */
  async findUserRulesWithSlots(
    id: number, 
    after: string, 
    before: string
  ): Promise<IRule.FindUserRulesWithSlotsApiResponse> {
    return await this.get(`/api/v1/rule/slots/${id}`, {}, { after, before });
  }

  /**
   * @param id user id (interviewer or tutor)
   * @param start  utc start time
   * @param end utc end time
   */
  async findUnpackedUserRules(
    id: number,
    start: string,
    end: string
  ): Promise<IRule.FindUnpackedUserRulesResponse> {
    return await this.get(`/api/v1/rule/list/unpacked/${id}`, {}, {
      start,
      end,
    });
  }

  async update(
    id: number,
    payload: IRule.UpdateApiPayload
  ): Promise<IRule.Self> {
    return await this.put(`/api/v1/rule/${id}`, payload);
  }

  async delete(id: number): Promise<IRule.Self> {
    return await this.del(`/api/v1/rule/${id}`);
  }
}
