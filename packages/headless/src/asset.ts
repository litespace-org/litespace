import { useCallback } from "react";
import { useApi } from "@/api";
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
  const api = useApi();

  const findAsset = useCallback(async () => {
    if (!name) return null;
    return await api.asset.getAssetBlob(name, type);
  }, [api.asset, name, type]);

  return useQuery({
    queryKey: [QueryKey.FindAsset, name, type],
    queryFn: findAsset,
    enabled: !!name,
  });
}
