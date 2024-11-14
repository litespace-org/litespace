import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { useRender } from "@litespace/luna/hooks/common";
import { Typography } from "@litespace/luna/Typography";
import ImageDialog from "@/components/common/ImageDialog";
import React, { useMemo } from "react";
import { useAssetBlob } from "@litespace/headless/asset";
import { IAsset } from "@litespace/types";
import { Loading } from "@litespace/luna/Loading";
import Error from "@/components/common/Error";
import { orUndefined } from "@litespace/sol/utils";

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
        type={ButtonType.Main}
        size={ButtonSize.Tiny}
        variant={ButtonVariant.Secondary}
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
