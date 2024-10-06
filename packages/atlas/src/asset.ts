import { Base } from "@/base";

export class Asset extends Base {
  find(): Promise<string[]> {
    return this.client
      .get<string[]>("/api/v1/asset/list")
      .then((response) => response.data);
  }

  async delete(name: string): Promise<void> {
    await this.client.delete(`/api/v1/asset/${name}`);
  }
}
