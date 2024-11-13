import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { useRender } from "@litespace/luna/hooks/common";
import { Typography } from "@litespace/luna/Typography";
import ImageDialog from "@/components/common/ImageDialog";
import React from "react";
import { useAssetBlob } from "@litespace/headless/asset";
import { IAsset } from "@litespace/types";
import { Loading } from "@litespace/luna/Loading";
import Error from "@/components/common/Error";

const ImageField: React.FC<{
  name: string | null;
  locator?: (name: string) => string;
  type: IAsset.AssetType;
}> = ({ name, type = "public" }) => {
  const image = useRender();

  const iamgeFetcher = useAssetBlob(name || "", type);

  if (iamgeFetcher.isLoading) return <Loading />;

  if (iamgeFetcher.isError)
    return (
      <Error
        refetch={iamgeFetcher.refetch}
        title="error"
        error={iamgeFetcher.error}
      />
    );

  if (!name) return <Typography tag="p">-</Typography>;

  const data = iamgeFetcher.data?.data;
  const imageURl = URL.createObjectURL(data);

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
          image={imageURl}
          close={image.hide}
          open={image.open}
          name={name}
        />
      ) : null}
    </>
  );
};

export default ImageField;
