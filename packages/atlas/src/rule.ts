import { Base } from "@/base";
import { IRule } from "@litespace/types";

export class Rule extends Base {
  async create(payload: IRule.CreateApiPayload): Promise<IRule.Self> {
    return await this.post({ route: `/api/v1/rule/`, payload });
  }

  /**
   * @param id user id (interviewer or tutor)
   * @deprecated should be removed in favor of {@link findUserRulesWithSlots}
   */
  async findUserRules(id: number): Promise<IRule.Self[]> {
    return await this.get({ route: `/api/v1/rule/list/${id}` });
  }

  async findUserRulesWithSlots({
    id,
    before,
    after,
  }: {
    /**
     * user id (manger or tutor)
     */
    id: number;
  } & IRule.FindRulesWithSlotsApiQuery): Promise<IRule.FindUserRulesWithSlotsApiResponse> {
    return await this.get({
      route: `/api/v1/rule/slots/${id}`,
      params: { after, before },
    });
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
    return await this.get({
      route: `/api/v1/rule/list/unpacked/${id}`,
      params: {
        start,
        end,
      },
    });
  }

  async update(
    id: number,
    payload: IRule.UpdateApiPayload
  ): Promise<IRule.Self> {
    return await this.put({ route: `/api/v1/rule/${id}`, payload });
  }

  async delete(id: number): Promise<IRule.Self> {
    return await this.del({ route: `/api/v1/rule/${id}` });
  }
}
