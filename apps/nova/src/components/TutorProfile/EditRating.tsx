import { Dialog } from "@litespace/luna";
import React from "react";
import RateForm from "./RateForm";
import { IRating } from "@litespace/types";

type EditRatingProps = {
  title: string;
  open: boolean;
  close: () => void;
  rate: IRating.Populated;
};

const EditRating: React.FC<EditRatingProps> = ({
  title,
  open,
  close,
  rate,
}) => {
  return (
    <Dialog className="sm:w-1/2" title={title} open={open} close={close}>
      <RateForm close={close} tutor={rate.ratee.id} rate={rate} />
    </Dialog>
  );
};
export default EditRating;
