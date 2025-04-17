import { IUser, Void } from "@litespace/types";
import React, { useEffect } from "react";
import Stream from "@/components/Session/Stream";
import Controllers, { Controller } from "@/components/Session/Controllers";
import Ready from "@/components/Session/Ready";
import { useSearchParams } from "react-router-dom";

const PreSession: React.FC<{
  self: {
    id: number;
    image: string | null;
    name: string | null;
    stream: MediaStream | null;
    audio: boolean;
    video: boolean;
    speaking: boolean;
  };
  member: {
    id: number;
    role: IUser.Role;
    gender: IUser.Gender;
    joined: boolean;
  };
  start: string;
  duration: number;
  join: Void;
  disabled: boolean;
  loading: boolean;
  error: boolean;
  video: Controller;
  audio: Controller;
}> = ({
  self,
  member,
  start,
  duration,
  join,
  disabled,
  loading,
  error,
  audio,
  video,
}) => {
  const [params, setParams] = useSearchParams();

  /**
   * Based on the design, the pre-session should have a navigation. We need to
   * make sure to remove it incase it is still their.
   */
  useEffect(() => {
    if (params.get("nav")) setParams({});
  }, [params, setParams]);

  return (
    <div className="h-full flex flex-col gap-4 max-w-screen-3xl mx-auto">
      <div className="flex-1 h-0">
        <Stream
          stream={self.stream}
          video={self.video}
          audio={self.audio}
          speaking={self.speaking}
          userId={self.id}
          userImage={self.image}
          userName={self.name}
          size="md"
          muted
        />
      </div>
      <div className="flex flex-col gap-4">
        <Ready
          otherMember={member}
          start={start}
          duration={duration}
          join={join}
          disabled={disabled}
          loading={loading}
          error={error}
        />
        <Controllers video={video} audio={audio} />
      </div>
    </div>
  );
};

export default PreSession;
