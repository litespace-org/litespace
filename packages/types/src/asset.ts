export enum AssetType {
  Photo = "photo",
  Video = "video",
  Thumbnail = "thumbnail",
  Receipt = "receipt",
  Public = "public",
  Private = "private",
}

export type uploadPayload = {
  /**
   * asset id (name)
   */
  id?: string;
  /**
   * the owner id of the asset
   */
  ownerId: number;
  type: AssetType;
};

export type dropPayload = {
  /**
   * asset id (name)
   */
  id: string;
  ownerId: number;
};
