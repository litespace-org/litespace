import Logo from "@litespace/assets/Logo";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import React, { useState } from "react";

const PhotoSession: React.FC = () => {
  const [showExample, setShowExample] = useState<boolean>(false);
  return (
    <SessionExample
      showExample={showExample}
      setShowExample={() => setShowExample(true)}
    />
  );
};

const List = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <>
      {children.map((child) => {
        return (
          <div className="flex gap-2">
            <div className="rounded-full bg-natural-950 w-[10px] h-[6px] overflow-hidden mt-2" />
            {child}
          </div>
        );
      })}
    </>
  );
};

const SessionExample = ({
  showExample,
  setShowExample,
}: {
  showExample: boolean;
  setShowExample: Void;
}) => {
  const intl = useFormatMessage();
  const [open, setOpen] = useState(false);

  return (
    <div className="w-[569px] mx-auto mt-[60px] flex flex-col items-center">
      <div className="flex gap-4 mb-10">
        <Typography tag="h3" className="text-h4 text-brand-500 font-bold">
          {intl("labels.litespace")}
        </Typography>
        <Logo className="w-14 h-14" />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 items-center text-center">
          <Typography tag="h3" className="text-h3 font-bold text-natural-950">
            {intl("tutor-onboarding.step.photo-session.title")}
          </Typography>
          <Typography
            tag="p"
            className="text-body font-normal text-natural-700"
          >
            {intl("tutor-onboarding.steps.photo-session.desc")}
          </Typography>
          {showExample ? (
            <Button
              size="large"
              variant="secondary"
              onClick={() => setOpen(true)}
            >
              <Typography tag="span" className="text">
                {intl("tutor-onboarding.step.photo-session.show-example")}
              </Typography>
            </Button>
          ) : null}
          <Dialog open={open} close={() => setOpen(false)}>
            <VideoPlayer />
          </Dialog>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          <Typography
            tag="h5"
            className="text-natural-950 font-bold text-subtitle-2"
          >
            {intl("tutor-onboarding.step.photo-session.studio-visit.title")}
          </Typography>
          <List>
            <Typography
              tag="p"
              className="text-caption text-natural-950 font-normal"
            >
              {intl("tutor-onboarding.step.photo-session.studio-visit.desc-1")}
            </Typography>
            <Typography
              tag="p"
              className="text-caption text-natural-950 font-normal"
            >
              {intl("tutor-onboarding.step.photo-session.studio-visit.desc-2")}
            </Typography>
          </List>
        </div>
      </div>
      {!showExample ? (
        <Button size="large" className="self-start" onClick={setShowExample}>
          <Typography tag="span" className="text">
            {intl("tutor-onboarding.step.photo-session.contact-us.btn")}
          </Typography>
        </Button>
      ) : null}
      {showExample ? (
        <Button size="large" className="self-start">
          <Typography tag="span" className="text">
            {intl("tutor-onboarding.step.photo-session.book-session.btn")}
          </Typography>
        </Button>
      ) : null}
    </div>
  );
};

export default PhotoSession;
