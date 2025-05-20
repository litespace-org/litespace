import { Base } from "@/lib/base";
import { ISession } from "@litespace/types";

export class Recorder extends Base {
  async record(sessionId: ISession.Id): Promise<void> {
    return this.post({ route: `/record/${sessionId}` });
  }
}
