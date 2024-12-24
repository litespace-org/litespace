import { CacheBase } from "@/cache/base";

export class Peer extends CacheBase {
  readonly prefix = "peer";
  readonly ttl = 60 * 60 * 12; // 12 hours

  async setUserPeerId(user: number, peer: string) {
    await this.client.set(this.asUserField(user), peer, {
      EX: this.ttl,
    });
  }

  async setGhostPeerId(session: string, peer: string) {
    await this.client.set(this.asGhostField(session), peer, {
      EX: this.ttl,
    });
  }

  async getUserPeerId(user: number): Promise<string | null> {
    return await this.client.get(this.asUserField(user));
  }

  async getGhostPeerId(session: string): Promise<string | null> {
    return await this.client.get(this.asGhostField(session));
  }

  async removeUserPeerId(user: number) {
    await this.client.del(this.asUserField(user));
  }

  async removeGhostPeerId(session: string) {
    await this.client.del(this.asGhostField(session));
  }

  asUserField(user: number): string {
    return [this.prefix, user].join(":");
  }

  asGhostField(session: string): string {
    return [this.prefix, "ghost", session].join(":");
  }
}
