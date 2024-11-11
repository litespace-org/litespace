import { Dialog } from "@litespace/luna/Dialog";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { Void } from "@litespace/types";
import React from "react";

const ImageDialog: React.FC<{
  image: string;
  close: Void;
  open: boolean;
  locator?: (name: string) => string;
}> = ({ image, open, close, locator = asFullAssetUrl }) => {
  // todo: handle authorization
  return (
    <Dialog className="min-w-[40rem]" title={image} close={close} open={open}>
      <div className="max-h-[80vh] overflow-hidden">
        <img className="object-contain w-full h-full" src={locator(image)} />
      </div>
    </Dialog>
  );
};

export default ImageDialog;
