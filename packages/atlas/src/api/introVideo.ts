import { Base } from "@/lib/base";
import { asFormData } from "@/lib/form";
import { IIntroVideo } from "@litespace/types";

export class IntroVideo extends Base {
  async create(
    payload: IIntroVideo.CreateApiPayload & IIntroVideo.CreateApiFiles
  ): Promise<void> {
    return this.post({
      route: "/api/v1/intro-video",
      payload: asFormData(payload),
    });
  }
}
