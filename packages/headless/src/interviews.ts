import { useApi } from "@/api/index";
import { IInterview, IFilter } from "@litespace/types";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { usePaginate } from "@/pagination";
import { OnError, OnSuccess } from "@/types/query";
import { useExtendedQuery } from "@/query";

export function useFindInterviews(filter?: IInterview.FindApiQuery) {
  const api = useApi();

  const findInterviews = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      return api.interview.find({ page, size, ...filter });
    },
    [api.interview, filter]
  );

  return usePaginate(findInterviews, [QueryKey.FindInterviewsPaged, filter]);
}

export function useSelectInterviewer() {
  const api = useApi();

  const selectInterviewer = useCallback(async () => {
    return api.interview.selectInterviewer();
  }, [api.interview]);

  return useExtendedQuery({
    queryFn: selectInterviewer,
    queryKey: [QueryKey.SelectInterviewer],
  });
}

export function useCreateInterview({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IInterview.CreateApiResponse>;
  onError?: OnError;
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
