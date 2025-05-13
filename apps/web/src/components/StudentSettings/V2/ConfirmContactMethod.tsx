import { VerifyEmail } from "@/components/Common/VerifyEmail";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useState } from "react";

export const ConfirmContactMethod: React.FC<{
  verifiedEmail: boolean;
  verifiedPhone: boolean;
}> = ({ verifiedEmail, verifiedPhone }) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {!verifiedEmail ? <VerifyEmailSection /> : null}
      {!verifiedPhone ? <VerifyPhoneSection /> : null}
    </div>
  );
};

const VerifyEmailSection: React.FC = () => {
  const intl = useFormatMessage();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  return (
    <div className="flex gap-14 items-end">
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
          {intl("student-settings.verify-email.title")}
        </Typography>
        <Typography className="mt-4 text-body text-natural-950" tag="p">
          {intl("student-settings.verify-email.description")}
        </Typography>
      </div>
      <Button
        onClick={() => setShowVerifyDialog(true)}
        size="large"
        className="min-w-fit"
        variant="secondary"
      >
        {intl("student-settings.verify-email.title")}
      </Button>
    </div>
  );
};

const VerifyPhoneSection: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex gap-14 items-end">
      <div>
        <Typography
          className="text-subtitle-2 font-bold text-natural-950"
          tag="h3"
        >
          {intl("student-settings.verify-phone.title")}
        </Typography>
        <Typography className="mt-4 text-body text-natural-950" tag="p">
          {intl("student-settings.verify-phone.description")}
        </Typography>
      </div>
      <Button size="large" className="min-w-fit" variant="secondary">
        {intl("student-settings.verify-phone.title")}
      </Button>
    </div>
  );
};
