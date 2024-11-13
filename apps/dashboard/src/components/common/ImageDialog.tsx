import { Dialog } from "@litespace/luna/Dialog";
import { Void } from "@litespace/types";
import React from "react";

const ImageDialog: React.FC<{
  image: string;
  close: Void;
  open: boolean;
  name: string;
}> = ({ image, open, close, name }) => {
  // todo: handle authorization
  return (
    <Dialog className="min-w-[40rem]" title={name} close={close} open={open}>
      <div className="max-h-[80vh] overflow-hidden">
        <img className="object-contain w-full h-full" src={image} />
      </div>
    </Dialog>
  );
};

export default ImageDialog;
