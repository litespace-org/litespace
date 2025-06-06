import { useApi } from "@/api/index";
import { IInterview, IUser, IFilter } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { usePaginate } from "@/pagination";
import { OnError, OnSuccess } from "@/types/query";

export function useFindInterviews(
  filter?: IInterview.FindApiQuery & { userOnly?: boolean }
) {
  const api = useApi();

  const findInterviews = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (filter?.userOnly && !filter?.users) return { list: [], total: 0 };
      return api.interview.find({ page, size, ...filter });
    },
    [api.interview, filter]
  );

  return usePaginate(findInterviews, [QueryKey.FindInterviewsPaged, filter]);
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
  onSuccess: OnSuccess<IInterview.CreateApiResponse>;
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
  onSuccess?: OnSuccess<IInterview.UpdateApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const update = useCallback(
    async (payload: IInterview.UpdateApiPayload) => {
      return api.interview.update(payload);
    },
    [api.interview]
  );

  return useMutation({
    mutationFn: update,
    onSuccess: onSuccess,
    onError: onError,
    mutationKey: [MutationKey.UpdateInterview],
  });
}
