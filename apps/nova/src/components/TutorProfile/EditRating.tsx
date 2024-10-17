import { Dialog, useFormatMessage } from "@litespace/luna";
import React from "react";
import RateForm from "./RateForm";
import { IRating } from "@litespace/types";

type EditRatingProps = {
  open: boolean;
  close: () => void;
  rate: IRating.Populated;
};

const EditRating: React.FC<EditRatingProps> = ({ open, close, rate }) => {
  const intl = useFormatMessage();
  return (
    <Dialog
      className="sm:w-1/2"
      title={intl("tutor.rate.editmessage")}
      open={open}
      close={close}
    >
      <RateForm close={close} tutor={rate.ratee.id} rate={rate} />
    </Dialog>
  );
};
export default EditRating;
