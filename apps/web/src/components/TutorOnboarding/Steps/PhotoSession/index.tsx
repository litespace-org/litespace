import Logo from "@litespace/assets/Logo";
import { useRender } from "@litespace/headless/common";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { VideoDialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import {
  MAIN_TUTOR_MANAGER_TELEGRAM_URL,
  VIDEO_SESSION_EXAMPLE,
} from "@litespace/utils";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const PhotoSession: React.FC = () => {
  const example = useRender();

  return (
    <SessionExample
      showExample={example.open}
      setShowExample={() => example.show()}
    />
  );
};

const SessionExample: React.FC<{
  showExample: boolean;
  setShowExample: Void;
}> = ({ showExample, setShowExample }) => {
  const intl = useFormatMessage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-[569px] mx-auto mt-[60px] flex flex-col items-center">
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
            className="text-tiny font-normal text-natural-700 max-w-[489px]"
          >
            {intl("tutor-onboarding.step.photo-session.desc")}
          </Typography>
          {showExample ? (
            <Button
              size="large"
              variant="secondary"
              onClick={() => setOpen(true)}
            >
              <Typography
                tag="span"
                className="text text-body font-medium text-brand-500"
              >
                {intl("tutor-onboarding.step.photo-session.show-example")}
              </Typography>
            </Button>
          ) : null}
          <VideoDialog open={open} close={() => setOpen(false)}>
            <VideoPlayer src={VIDEO_SESSION_EXAMPLE} />
          </VideoDialog>
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
          {intl("tutor-onboarding.step.photo-session.contact-us.btn")}
        </Button>
      ) : null}
      {showExample ? (
        <Link
          to={MAIN_TUTOR_MANAGER_TELEGRAM_URL}
          className="self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Button
            tabIndex={-1}
            size="large"
            className="text-body font-medium text-natural-50"
          >
            {intl("tutor-onboarding.step.photo-session.book-session.btn")}
          </Button>
        </Link>
      ) : null}
    </div>
  );
};

const List: React.FC<{
  children: React.ReactNode[];
}> = ({ children }) => {
  return (
    <div className="flex flex-col gap-4">
      {children.map((child, idx) => {
        return (
          <div key={idx} className="flex gap-2">
            <div className="rounded-full bg-natural-950 w-[10px] h-[6px] overflow-hidden mt-2" />
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default PhotoSession;
