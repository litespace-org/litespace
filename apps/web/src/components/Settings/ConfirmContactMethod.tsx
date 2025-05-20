import { VerifyEmail } from "@/components/Common/VerifyEmail";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useState } from "react";
import cn from "classnames";
import VerifyPhone from "@/components/Common/VerifyPhone";

export const ConfirmContactMethod: React.FC<{
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  forStudent: boolean;
}> = ({ verifiedEmail, verifiedPhone, forStudent }) => {
  return (
    <div
      className={cn(
        "w-full flex gap-6",
        forStudent ? "flex-col-reverse" : "flex-col"
      )}
    >
      {!verifiedPhone ? <VerifyPhoneSection forStudent={forStudent} /> : null}
      {!verifiedEmail ? <VerifyEmailSection forStudent={forStudent} /> : null}
    </div>
  );
};

const VerifyEmailSection: React.FC<{
  forStudent: boolean;
}> = ({ forStudent }) => {
  const intl = useFormatMessage();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  return (
    <div className="flex flex-wrap lg:flex-nowrap lg:gap-[57px] items-end">
      {showVerifyDialog ? (
        <VerifyEmail
          close={() => {
            setShowVerifyDialog(false);
          }}
        />
      ) : null}
      <div>
        <Typography
          className="text-subtitle-2 font-bold text-natural-950"
          tag="h3"
        >
          {intl(
            forStudent
              ? "student-settings.verify-email.title"
              : "tutor-settings.verify-email.title"
          )}
        </Typography>
        <Typography className="mt-4 text-body text-natural-950" tag="p">
          {intl(
            forStudent
              ? "student-settings.verify-email.description"
              : "tutor-settings.verify-email.description"
          )}
        </Typography>
      </div>
      <Button
        onClick={() => setShowVerifyDialog(true)}
        size="large"
        className="min-w-fit mt-4 lg:mt-0 w-[173px]"
        variant="secondary"
      >
        {intl("student-settings.verify-email.title")}
      </Button>
    </div>
  );
};

const VerifyPhoneSection: React.FC<{ forStudent: boolean }> = ({
  forStudent,
}) => {
  const intl = useFormatMessage();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  return (
    <div className="flex flex-wrap lg:flex-nowrap lg:gap-[57px] items-end">
      {showVerifyDialog ? (
        <VerifyPhone
          close={() => {
            setShowVerifyDialog(false);
          }}
        />
      ) : null}
      <div>
        <Typography
          className="text-subtitle-2 font-bold text-natural-950"
          tag="h3"
        >
          {intl(
            forStudent
              ? "student-settings.verify-phone.title"
              : "tutor-settings.verify-phone.title"
          )}
        </Typography>
        <Typography className="mt-4 text-body text-natural-950" tag="p">
          {intl(
            forStudent
              ? "student-settings.verify-phone.description"
              : "tutor-settings.verify-phone.description"
          )}
        </Typography>
      </div>
      <Button
        onClick={() => setShowVerifyDialog(true)}
        size="large"
        className="mt-4 lg:mt-0 min-w-[173px]"
        variant="secondary"
      >
        {intl("student-settings.verify-phone.title")}
      </Button>
    </div>
  );
};
