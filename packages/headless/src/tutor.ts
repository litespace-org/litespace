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
  const atlas = useApi();

  const findTutors = useCallback(
    ({ pageParam }: { pageParam: number }) => {
      return atlas.user.findOnboardedTutors({ page: pageParam });
    },
    [atlas.user]
  );

  return useInfinitePaginationQuery(findTutors, [QueryKey.FindTutors]);
}

export function useFindStudioTutor(tutorId: number | null) {
  const atlas = useApi();

  const findStudioTutor = useCallback(async () => {
    if (!tutorId) return null;
    return await atlas.user.findStudioTutor({ tutorId });
  }, [atlas.user, tutorId]);

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
  const atlas = useApi();

  const findTutorStats = useCallback(() => {
    if (!id) return null;
    return atlas.user.findTutorStats(id);
  }, [atlas.user, id]);

  return useQuery({
    queryFn: findTutorStats,
    queryKey: [QueryKey.FindTutorStats, id],
    enabled: !!id,
    retry: false,
  });
}

export function useFindStudioTutors(studioId?: number, search?: string) {
  const atlas = useApi();

  const findStudioTutors = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await atlas.user.findStudioTutors({
        studioId,
        search,
        pagination: { page: pageParam },
      });
    },
    [atlas.user, search, studioId]
  );

  return useInfinitePaginationQuery(findStudioTutors, [
    QueryKey.FindStudioTutors,
    studioId,
  ]);
}

export function useFindPersonalizedTutorStats() {
  const atlas = useApi();
  const findStats = useCallback(async () => {
    return await atlas.user.findPersonalizedTutorStats();
  }, [atlas.user]);

  return useQuery({
    queryKey: [QueryKey.FindPersonalizedTutorStats],
    queryFn: findStats,
  });
}

export function useFindTutorActivityScore(
  id: number | null
): UseQueryResult<ITutor.ActivityScoreMap | null, Error> {
  const atlas = useApi();

  const findTutorAcivityScores = useCallback(() => {
    if (!id) return null;
    return atlas.user.findTutorActivityScores(id);
  }, [atlas.user, id]);

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
  const atlas = useApi();
  const share = useCallback(
    async (feedback: string) => {
      return await atlas.interview.update(interviewId, {
        feedback: { interviewee: feedback },
      });
    },
    [atlas.interview, interviewId]
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
  const atlas = useApi();

  const introduceTutor = useCallback(
    async (fields: IForm) => {
      if (!profile) return;
      return await atlas.user.update(profile.id, {
        bio: fields.bio,
        about: fields.about,
      });
    },
    [atlas.user, profile]
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
  const atlas = useApi();

  const findTutorMeta = useCallback(async () => {
    if (!id) return null;
    return await atlas.user.findTutorMeta(id);
  }, [atlas.user, id]);

  return useQuery({
    queryFn: findTutorMeta,
    queryKey: [QueryKey.FindTutorMeta, id],
    enabled: !!id,
  });
}

export function useFindTutorInfo(id: number | null) {
  const atlas = useApi();

  const findTutorInfo = useCallback(async () => {
    if (!id) return null;
    return await atlas.user.findTutorInfo(id);
  }, [atlas.user, id]);

  return useQuery({
    queryFn: findTutorInfo,
    queryKey: [QueryKey.FindTutorInfo, id],
    enabled: !!id,
  });
}
