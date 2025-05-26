import { Base } from "@/lib/base";
import { IAsset } from "@litespace/types";

export class Asset extends Base {
  async getAssetBlob(name: string, type: IAsset.AssetType): Promise<Blob> {
    const url =
      type === "public"
        ? `/assets/uploads/${name}`
        : `/assets/receipts/${name}`;
    const { data } = await this.client.get(url, { responseType: "blob" });
    return data;
  }
}
