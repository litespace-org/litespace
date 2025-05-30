export type AssetType = "public" | "private";

export type FindAssetsApiResponse = {
  list: string[];
  total: number;
};

export type SampleAssetApiResponse = string;
