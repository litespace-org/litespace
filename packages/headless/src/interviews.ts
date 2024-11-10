import { useAtlas } from "@/atlas/index";
import { IInterview, Void, IUser, IFilter, Element } from "@litespace/types";
import { useCallback } from "react";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { usePaginate, UsePaginateResult } from "@/pagination";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export type UseFindInterviewsPayload = Omit<
  IInterview.FindInterviewsApiQuery,
  "page" | "size"
> & {
  userOnly?: boolean;
};

export function useFindInterviews(
  filter?: UseFindInterviewsPayload
): UsePaginateResult<Element<IInterview.FindInterviewsApiResponse["list"]>> {
  const atlas = useAtlas();

  const findInterviews = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (filter?.userOnly && !filter?.users) return { list: [], total: 0 };
      return atlas.interview.findInterviews({
        page,
        size,
        ...filter,
      });
    },
    [atlas.interview, filter]
  );

  return usePaginate(findInterviews, [QueryKey.FindInterviewsPaged, filter]);
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
    mutationKey: [MutationKey.CreateInterview],
  });
}

export function useUpdateInterview({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const updateInterview = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IInterview.UpdateApiPayload;
    }) => {
      return atlas.interview.update(id, payload);
    },
    [atlas.interview]
  );

  return useMutation({
    mutationFn: updateInterview,
    onSuccess: onSuccess,
    onError: onError,
    mutationKey: [MutationKey.UpdateInterview],
  });
}
