import {
  Button,
} from "@litespace/ui/Button";
import { useRender } from "@litespace/ui/hooks/common";
import { Typography } from "@litespace/ui/Typography";
import ImageDialog from "@/components/common/ImageDialog";
import React, { useMemo } from "react";
import { useAssetBlob } from "@litespace/headless/asset";
import { IAsset } from "@litespace/types";
import { Loading } from "@litespace/ui/Loading";
import Error from "@/components/common/Error";
import { orUndefined } from "@litespace/utils/utils";

const ImageField: React.FC<{
  name: string | null;
  type: IAsset.AssetType;
}> = ({ name, type = "public" }) => {
  const image = useRender();

  const asset = useAssetBlob({ name: orUndefined(name), type });

  const url = useMemo(() => {
    const data = asset.data;
    if (!data) return null;
    return URL.createObjectURL(data);
  }, [asset.data]);

  if (asset.isLoading) return <Loading />;

  if (asset.isError)
    return <Error refetch={asset.refetch} title="error" error={asset.error} />;

  if (!name || !url) return <Typography element="body">-</Typography>;

  return (
    <>
      <Button
        type={"main"}
        size={"tiny"}
        variant={"secondary"}
        onClick={image.show}
      >
        <Typography element="caption" className="truncate inline-block w-16">
          {name}
        </Typography>
      </Button>

      {name && image.open ? (
        <ImageDialog
          image={url}
          close={image.hide}
          open={image.open}
          name={name}
        />
      ) : null}
    </>
  );
};

export default ImageField;
