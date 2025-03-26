import { useCallback } from "react";
import { useApi } from "@/api";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { IInterview, ITutor, IUser, Void } from "@litespace/types";
import { MutationKey, QueryKey } from "@/constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useInfinitePaginationQuery } from "@/query";

dayjs.extend(utc);

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useTutors() {
  const api = useApi();

  const findTutors = useCallback(
    ({ pageParam }: { pageParam: number }) => {
      return api.user.findOnboardedTutors({ page: pageParam });
    },
    [api.user]
  );

  return useInfinitePaginationQuery(findTutors, [QueryKey.FindTutors]);
}

export function useFindStudioTutor(tutorId: number | null) {
  const api = useApi();

  const findStudioTutor = useCallback(async () => {
    if (!tutorId) return null;
    return await api.user.findStudioTutor({ tutorId });
  }, [api.user, tutorId]);

  return useQuery({
    queryFn: findStudioTutor,
    queryKey: [QueryKey.FindStudioTutor, tutorId],
    enabled: !!tutorId,
    retry: false,
  });
}

export function useFindTutorStats(
  id: number | null
): UseQueryResult<ITutor.FindTutorStatsApiResponse | null, Error> {
  const api = useApi();

  const findTutorStats = useCallback(() => {
    if (!id) return null;
    return api.user.findTutorStats(id);
  }, [api.user, id]);

  return useQuery({
    queryFn: findTutorStats,
    queryKey: [QueryKey.FindTutorStats, id],
    enabled: !!id,
    retry: false,
  });
}

export function useFindStudioTutors(studioId?: number, search?: string) {
  const api = useApi();

  const findStudioTutors = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await api.user.findStudioTutors({
        studioId,
        search,
        pagination: { page: pageParam },
      });
    },
    [api.user, search, studioId]
  );

  return useInfinitePaginationQuery(findStudioTutors, [
    QueryKey.FindStudioTutors,
    studioId,
  ]);
}

export function useFindPersonalizedTutorStats() {
  const api = useApi();
  const findStats = useCallback(async () => {
    return await api.user.findPersonalizedTutorStats();
  }, [api.user]);

  return useQuery({
    queryKey: [QueryKey.FindPersonalizedTutorStats],
    queryFn: findStats,
  });
}

export function useFindTutorActivityScore(
  id: number | null
): UseQueryResult<ITutor.ActivityScoreMap | null, Error> {
  const api = useApi();

  const findTutorAcivityScores = useCallback(() => {
    if (!id) return null;
    return api.user.findTutorActivityScores(id);
  }, [api.user, id]);

  return useQuery({
    queryFn: findTutorAcivityScores,
    queryKey: [QueryKey.FindTutorActivity, id],
    enabled: !!id,
    retry: false,
  });
}

export function useShareFeedback(
  interviewId: number
): UseMutationResult<IInterview.Self, Error, string, unknown> {
  const api = useApi();
  const share = useCallback(
    async (feedback: string) => {
      return await api.interview.update(interviewId, {
        feedback: { interviewee: feedback },
      });
    },
    [api.interview, interviewId]
  );
  return useMutation({
    mutationFn: share,
    mutationKey: [MutationKey.ShareFeedback],
  });
}

type IForm = {
  bio: string;
  about: string;
};

export function useIntroduceTutor({
  profile,
  onSuccess,
  onError,
}: {
  profile: IUser.Self | null;
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const introduceTutor = useCallback(
    async (fields: IForm) => {
      if (!profile) return;
      return await api.user.update(profile.id, {
        bio: fields.bio,
        about: fields.about,
      });
    },
    [api.user, profile]
  );

  return useMutation({
    mutationFn: introduceTutor,
    onSuccess: onSuccess,
    onError: onError,
    mutationKey: ["update-tutor-info"],
  });
}

export function useFindTutorMeta(
  id?: number
): UseQueryResult<ITutor.FindTutorMetaApiResponse> {
  const api = useApi();

  const findTutorMeta = useCallback(async () => {
    if (!id) return null;
    return await api.user.findTutorMeta(id);
  }, [api.user, id]);

  return useQuery({
    queryFn: findTutorMeta,
    queryKey: [QueryKey.FindTutorMeta, id],
    enabled: !!id,
  });
}

export function useFindTutorInfo(id: number | null) {
  const api = useApi();

  const findTutorInfo = useCallback(async () => {
    if (!id) return null;
    return await api.user.findTutorInfo(id);
  }, [api.user, id]);

  return useQuery({
    queryFn: findTutorInfo,
    queryKey: [QueryKey.FindTutorInfo, id],
    enabled: !!id,
  });
}
