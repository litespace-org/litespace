import { Base } from "@/base";
import { IAsset } from "@litespace/types";

export class Asset extends Base {
  async upload(payload: IAsset.uploadPayload): Promise<void> {
    await this.post({ route: `/api/v1/asset/`, payload });
  }
  async delete(payload: IAsset.dropPayload): Promise<void> {
    await this.del({ route: `/api/v1/asset/`, payload });
  }
  /**
   * @deprecated should be replaced after implementing new handler to retreive assets with s3
   */
  async getAssetBlob(name: string, type: IAsset.AssetType): Promise<Blob> {
    const url =
      type === "photo" ? `/assets/uploads/${name}` : `/assets/receipts/${name}`;
    const { data } = await this.client.get(url, { responseType: "blob" });
    return data;
  }
}
