import { CacheBase } from "@/cache/base";

export class Peer extends CacheBase {
  readonly prefix = "peer";
  readonly ttl = 60 * 60 * 12; // 12 hours

  async setUserPeerId(user: number, peer: string) {
    await this.client.set(this.asUserField(user), peer, {
      EX: this.ttl,
    });
  }

  async setGhostPeerId(call: number, peer: string) {
    await this.client.set(this.asGhostField(call), peer, {
      EX: this.ttl,
    });
  }

  async getUserPeerId(user: number): Promise<string | null> {
    return await this.client.get(this.asUserField(user));
  }

  async getGhostPeerId(call: number): Promise<string | null> {
    return await this.client.get(this.asGhostField(call));
  }

  async removeUserPeerId(user: number) {
    await this.client.del(this.asUserField(user));
  }

  async removeGhostPeerId(call: number) {
    await this.client.del(this.asGhostField(call));
  }

  asUserField(user: number): string {
    return [this.prefix, user].join(":");
  }

  asGhostField(call: number): string {
    return [this.prefix, "ghost", call].join(":");
  }
}
