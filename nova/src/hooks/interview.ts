import { atlas } from "@/lib/atlas";
import { useQuery } from "react-query";

export function useInterviews(userId: number) {
  return useQuery({
    queryFn: async () => {
      return await atlas.interview.findInterviews(userId);
    },
    queryKey: "get-tutuor-interviews",
  });
}
