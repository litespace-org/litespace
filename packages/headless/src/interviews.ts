import { useAtlas } from "@/atlas/index";
import { IUser, IInterview, ICall, Paginated, Void } from "@litespace/types";
import { useCallback } from "react";
import { usePaginationQuery } from "@/query";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { QueryKeys } from "@/constants";

type OnSuccess = Void;
type OnError = (error: Error) => void;

type useFindInterviewsProps = {
  query: UseInfiniteQueryResult<
    InfiniteData<
      Paginated<{
        interview: IInterview.Self;
        call: ICall.Self;
        members: ICall.PopuldatedMember[];
      }>,
      unknown
    >,
    Error
  >;
  list:
    | {
        interview: IInterview.Self;
        call: ICall.Self;
        members: ICall.PopuldatedMember[];
      }[]
    | null;
  more: () => void;
};

export function useFindPagedInterviews(
  profile: IUser.Self | null
): useFindInterviewsProps {
  const atlas = useAtlas();
  const findInterviews = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!profile) return { list: [], total: 0 };
      return atlas.interview.findInterviews(profile.id, {
        page: pageParam,
        size: 10,
      });
    },
    [profile]
  );
  return usePaginationQuery(findInterviews, [QueryKeys.FindInterviewsPaged]);
}

export function useFindInterviews(profile: IUser.Self | null) {
  const atlas = useAtlas();
  const findInterviews = useCallback(async () => {
    if (!profile) return { list: [], total: 0 };
    return await atlas.interview.findInterviews(profile.id);
  }, [profile]);
  return useQuery({
    queryFn: findInterviews,
    enabled: !!profile,
    queryKey: [QueryKeys.FindInterviews],
  });
}

export function useSelectInterviewer() {
  const atlas = useAtlas();
  const selectInterviewer = useCallback(async () => {
    return atlas.user.selectInterviewer();
  }, []);
  return useQuery({
    queryFn: selectInterviewer,
    queryKey: [QueryKeys.FindInterviewer],
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
