import { useCallback } from "react";
import { useAtlas } from "@/atlas";
import { IAsset } from "@litespace/types";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";

export function useAssetBlob({
  name,
  type,
}: {
  name?: string;
  type: IAsset.AssetType;
}) {
  const atlas = useAtlas();

  const findAsset = useCallback(async () => {
    if (!name) return null;
    return await atlas.asset.getAssetBlob(name, type);
  }, [atlas.asset, name, type]);

  return useQuery({
    queryKey: [QueryKey.FindAsset, name, type],
    queryFn: findAsset,
    enabled: !!name,
  });
}
