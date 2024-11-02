import { Dialog } from "@litespace/luna/components/Dialog";
import { asFullAssetUrl } from "@litespace/luna/lib";
import { Void } from "@litespace/types";
import React from "react";

const ImageDialog: React.FC<{ image: string; close: Void; open: boolean }> = ({
  image,
  close,
  open,
}) => {
  return (
    <Dialog className="" title={image} close={close} open={open}>
      <div className="max-w-[40rem] max-h-[80vh] overflow-hidden">
        <img
          className="object-contain w-full h-full"
          src={asFullAssetUrl(image)}
        />
      </div>
    </Dialog>
  );
};

export default ImageDialog;
