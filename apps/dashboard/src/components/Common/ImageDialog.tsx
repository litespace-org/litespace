import { Dialog } from "@litespace/ui/Dialog";
import { Void } from "@litespace/types";
import React from "react";

const ImageDialog: React.FC<{
  image: string;
  close: Void;
  open: boolean;
}> = ({ image, open, close }) => {
  return (
    <Dialog className="min-w-[40rem]" close={close} open={open}>
      <div className="max-h-[80vh] overflow-hidden">
        <img className="object-contain w-full h-full" src={image} />
      </div>
    </Dialog>
  );
};

export default ImageDialog;
