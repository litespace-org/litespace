import { useAtlas } from "@/atlas/index";
import { IInterview, Void, IUser } from "@litespace/types";
import { useCallback } from "react";
import { usePaginationQuery } from "@/query";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { QueryKey } from "@/constants";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useFindInterviews(
  user?: number
): IInterview.FindPagedInterviewsProps {
  const atlas = useAtlas();
  const findInterviews = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!user) return { list: [], total: 0 };
      return atlas.interview.findInterviews({
        user,
        page: pageParam,
        size: 10,
      });
    },
    [user]
  );
  return usePaginationQuery(findInterviews, [QueryKey.FindInterviewsPaged]);
}

export function useSelectInterviewer(): UseQueryResult<IUser.Self, Error> {
  const atlas = useAtlas();
  const selectInterviewer = useCallback(async () => {
    return atlas.user.selectInterviewer();
  }, []);
  return useQuery({
    queryFn: selectInterviewer,
    queryKey: [QueryKey.FindInterviewer],
  });
}

export function useCreateInterview({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createInterview = useCallback(
    async (payload: IInterview.CreateApiPayload) => {
      return atlas.interview.create(payload);
    },
    []
  );

  return useMutation({
    mutationFn: createInterview,
    onSuccess: onSuccess,
    onError: onError,
  });
}
