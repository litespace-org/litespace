import { useApi } from "@/api/index";
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
  const atlas = useApi();

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

export function useFindInfinitInterviews({
  user,
}: {
  user?: number;
}): UseInfinitePaginationQueryResult<
  Element<IInterview.FindFullInterviewsApiResponse["list"]>
> {
  const api = useApi();

  const findInterviews = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!user) return { list: [], total: 0 };
      return api.interview.findFullInterviews({
        users: user ? [user] : [],
        page: pageParam,
        size: 10,
      });
    },
    [api.interview, user]
  );

  return useInfinitePaginationQuery(findInterviews, [
    QueryKey.FindInterviewsPaged,
    user,
  ]);
}
console.log("");

export function useSelectInterviewer(): UseQueryResult<IUser.Self, Error> {
  const atlas = useApi();

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
  const atlas = useApi();

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
  const atlas = useApi();

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
