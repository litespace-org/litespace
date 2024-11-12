import { Base } from "@/base";
import { IPeer } from "@litespace/types";

export class Peer extends Base {
  async register(payload: IPeer.RegisterPeerIdApiPayload) {
    await this.post("/api/v1/peer", payload);
  }

  async delete(payload: IPeer.DeletePeerIdApiQurey) {
    await this.del("/api/v1/peer", payload);
  }

  async findPeerId(
    payload: IPeer.FindPeerIdApiQuery
  ): Promise<IPeer.FindPeerIdApiResponse> {
    return this.get("/api/v1/peer", null, payload);
  }
}
