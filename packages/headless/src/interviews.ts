import { useAtlas } from "@/atlas/index";
import { IInterview, Void, IUser, IFilter, Element } from "@litespace/types";
import { useCallback } from "react";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { usePaginate, UsePaginateResult } from "@/pagination";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useFindInterviews(payload?: {
  user?: number;
  userOnly?: boolean;
}): UsePaginateResult<Element<IInterview.FindInterviewsApiResponse["list"]>> {
  const atlas = useAtlas();

  const findInterviews = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (payload?.userOnly && !payload?.user) return { list: [], total: 0 };
      return atlas.interview.findInterviews({
        users: payload?.user ? [payload.user] : [],
        page,
        size,
      });
    },
    [atlas.interview, payload?.user, payload?.userOnly]
  );

  return usePaginate(findInterviews, [QueryKey.FindInterviewsPaged]);
}

export function useFindInfinitInterviews(
  user?: number
): UseInfinitePaginationQueryResult<
  Element<IInterview.FindInterviewsApiResponse["list"]>
> {
  const atlas = useAtlas();

  const findInterviews = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (user) return { list: [], total: 0 };
      return atlas.interview.findInterviews({
        users: user ? [user] : [],
        page: pageParam,
        size: 10,
      });
    },
    [atlas.interview, user]
  );

  return useInfinitePaginationQuery(findInterviews, [
    QueryKey.FindInterviewsPaged,
  ]);
}

export function useSelectInterviewer(): UseQueryResult<IUser.Self, Error> {
  const atlas = useAtlas();

  const selectInterviewer = useCallback(async () => {
    return atlas.user.selectInterviewer();
  }, [atlas.user]);

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
    [atlas.interview]
  );

  return useMutation({
    mutationFn: createInterview,
    onSuccess: onSuccess,
    onError: onError,
  });
}
