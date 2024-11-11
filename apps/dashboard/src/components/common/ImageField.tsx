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

const ImageField: React.FC<{
  name: string | null;
  locator?: (name: string) => string;
}> = ({ name, locator }) => {
  const image = useRender();
  if (!name) return "-";
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
          image={name}
          close={image.hide}
          open={image.open}
          locator={locator}
        />
      ) : null}
    </>
  );
};

export default ImageField;
