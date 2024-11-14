import { Base } from "@/base";
import { IAsset } from "@litespace/types";

export class Asset extends Base {
  find(): Promise<string[]> {
    return this.client
      .get<string[]>("/api/v1/asset/list")
      .then((response) => response.data);
  }

  async delete(name: string): Promise<void> {
    await this.client.delete(`/api/v1/asset/${name}`);
  }

  async getAssetBlob(name: string, type: IAsset.AssetType): Promise<Blob> {
    const url =
      type === "public"
        ? `/assets/uploads/${name}`
        : `/assets/receipts/${name}`;
    const { data } = await this.client.get(url, { responseType: "blob" });
    return data;
  }
}
