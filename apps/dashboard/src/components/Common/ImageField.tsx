import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/ui/hooks/common";
import { Typography } from "@litespace/ui/Typography";
import ImageDialog from "@/components/Common/ImageDialog";
import React from "react";

const ImageField: React.FC<{
  url: string | null;
}> = ({ url }) => {
  const image = useRender();

  if (!url)
    return (
      <Typography tag="span" className="text-body">
        -
      </Typography>
    );

  return (
    <>
      <Button
        type={"main"}
        size={"small"}
        variant="tertiary"
        onClick={image.show}
      >
        <Typography
          tag="span"
          className="truncate inline-block w-16 text-caption"
        >
          Open
        </Typography>
      </Button>

      {url && image.open ? (
        <ImageDialog image={url} close={image.hide} open={image.open} />
      ) : null}
    </>
  );
};

export default ImageField;
