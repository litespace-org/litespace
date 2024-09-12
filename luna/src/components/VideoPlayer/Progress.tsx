import React from "react";
import { Slider } from "@/components/Slider";

const Progress: React.FC<{
  current: number;
  duration: number;
  set: (time: number) => void;
}> = ({ current, duration, set }) => {
  return (
    <div className="px-3" dir="ltr">
      <Slider min={0} max={duration} value={current} onValueChange={set} />
    </div>
  );
};

export default Progress;
