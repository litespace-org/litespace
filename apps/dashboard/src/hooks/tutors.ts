import { ONBOARD_VALUES } from "@/components/utils/tutor";
import { ITutor } from "@litespace/types";

export const useMissedData = () => (info: ITutor.Full) => {
  const missedData: string[] = [];
  for (const key of ONBOARD_VALUES) {
    if (!info[key]) missedData.push(key);
  }
  return missedData;
};
