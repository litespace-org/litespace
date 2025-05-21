import { useApi } from "@/api/index";
import { IInterview, Void, IUser, IFilter, Element } from "@litespace/types";
import { useCallback, useMemo } from "react";
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
  const api = useApi();

  const findInterviews = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (filter?.userOnly && !filter?.users) return { list: [], total: 0 };
      return api.interview.findInterviews({
        page,
        size,
        ...filter,
      });
    },
    [api.interview, filter]
  );

  return usePaginate(findInterviews, [QueryKey.FindInterviewsPaged, filter]);
}

export function useFindInfinitInterviews(
  user?: number
): UseInfinitePaginationQueryResult<
  Element<IInterview.FindInterviewsApiResponse["list"]>
> {
  const api = useApi();

  const findInterviews = useCallback(
    async ({ page }: { page: number }) => {
      if (!user) return { list: [], total: 0 };
      return api.interview.findInterviews({
        users: user ? [user] : [],
        size: 10,
        page,
      });
    },
    [api.interview, user]
  );

  return useInfinitePaginationQuery(findInterviews, [
    QueryKey.FindInterviewsPaged,
    user,
  ]);
}

export function useSelectInterviewer(): {
  query: UseQueryResult<IUser.Self, Error>;
  keys: unknown[];
} {
  const api = useApi();

  const selectInterviewer = useCallback(async () => {
    return api.user.selectInterviewer();
  }, [api.user]);

  const keys = useMemo(() => [QueryKey.FindInterviewer], []);

  const query = useQuery({
    queryFn: selectInterviewer,
    queryKey: keys,
  });

  return { query, keys };
}

export function useCreateInterview({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const createInterview = useCallback(
    async (payload: IInterview.CreateApiPayload) => {
      return api.interview.create(payload);
    },
    [api.interview]
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
  const api = useApi();

  const updateInterview = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IInterview.UpdateApiPayload;
    }) => {
      return api.interview.update(id, payload);
    },
    [api.interview]
  );

  return useMutation({
    mutationFn: updateInterview,
    onSuccess: onSuccess,
    onError: onError,
    mutationKey: [MutationKey.UpdateInterview],
  });
}
