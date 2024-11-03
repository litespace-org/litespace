import { Dialog } from "@litespace/luna/Dialog";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";
import RateForm from "@/components/TutorProfile/RateForm";
import { IRating, Void } from "@litespace/types";

type EditRatingProps = {
  open: boolean;
  close: Void;
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
