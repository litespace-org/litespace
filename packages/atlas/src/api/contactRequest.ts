import { Base } from "@/lib/base";
import { IContactRequest } from "@litespace/types";

export class ContactRequest extends Base {
  async create(
    payload: IContactRequest.CreateContactRequestApiPayload
  ): Promise<IContactRequest.CreateContactRequestApiResponse> {
    return await this.post({
      route: `/api/v1/contact-request/`,
      payload,
    });
  }
}
