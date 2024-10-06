import React from "react";
import markdown from "@/markdown/tutorOnboarding/media.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
import { marked } from "marked";

const html = marked.parse(markdown, { async: false });

const MediaShot: React.FC = () => {
  return (
    <div>
      <RawHtml html={html} />
    </div>
  );
};

export default MediaShot;
