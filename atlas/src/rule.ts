import { Base } from "@/base";
import { IRule } from "@litespace/types";

export class Rule extends Base {
  async create(payload: IRule.CreateApiPayload): Promise<IRule.Self> {
    return await this.post(`/api/v1/rule/`, payload);
  }

  /**
   *
   * @param id user id (interviewer or tutor)
   * @param start  utc start time
   * @param end utc end time
   * @returns
   */
  async findUserRules(id: number): Promise<IRule.Self[]> {
    return this.get(`/api/v1/rule/list/${id}`);
  }

  async findUnpackedUserRules(
    id: number,
    start: string,
    end: string
  ): Promise<IRule.FindUnpackedUserRulesResponse> {
    return this.get(`/api/v1/rule/list/unpacked/${id}`, null, { start, end });
  }
}
