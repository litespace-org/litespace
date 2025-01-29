import { RawHtml } from "@litespace/ui/RawHtml";
import Title from "@/components/TutorProfile/Title";
import React from "react";

const About: React.FC<{ about: string | null }> = ({ about }) => {
  if (!about) return null;
  return (
    <div>
      <Title id={"labels.about.short"} />
      <div className="max-w-screen-sm">
        <RawHtml html={about} />
      </div>
    </div>
  );
};

export default About;
