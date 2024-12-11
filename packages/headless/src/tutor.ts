import { useCallback } from "react";
import { useAtlas } from "@/atlas";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { IInterview, IRule, ITutor, IUser, Void } from "@litespace/types";
import { MutationKey, QueryKey } from "@/constants";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useInfinitePaginationQuery } from "./query";

dayjs.extend(utc);

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useTutors() {
  const atlas = useAtlas();

  const findTutors = useCallback(
    ({ pageParam }: { pageParam: number }) => {
      return atlas.user.findOnboardedTutors({ page: pageParam });
    },
    [atlas.user]
  );

  return useInfinitePaginationQuery(findTutors, [QueryKey.FindTutors]);
}

export function useFindTutorById(
  id: number | null
): UseQueryResult<ITutor.FullTutor | null, Error> {
  const atlas = useAtlas();

  const findTutoById = useCallback(() => {
    if (!id) return null;
    return atlas.user.findTutorById(id);
  }, [atlas.user, id]);

  return useQuery({
    queryKey: [QueryKey.FindTutorById, id],
    queryFn: findTutoById,
    retry: false,
    enabled: !!id,
  });
}

export function useFindTutorStats(
  id: number | null
): UseQueryResult<ITutor.FindTutorStatsApiResponse | null, Error> {
  const atlas = useAtlas();

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

export function useFindTutorActivityScore(
  id: number | null
): UseQueryResult<ITutor.ActivityScoreMap | null, Error> {
  const atlas = useAtlas();

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

export function useFindUnpackedTutorRules({
  interviewer,
  start,
  end,
}: {
  interviewer: IUser.Self | undefined;
  start: Dayjs;
  end: Dayjs;
}): UseQueryResult<IRule.FindUnpackedUserRulesResponse | undefined, Error> {
  const atlas = useAtlas();

  const findUnpackedUserRoles = useCallback(async () => {
    if (!interviewer) return;
    return atlas.rule.findUnpackedUserRules(
      interviewer.id,
      start.utc().format("YYYY-MM-DD"),
      end.utc().format("YYYY-MM-DD")
    );
  }, [atlas.rule, end, interviewer, start]);

  return useQuery({
    queryFn: findUnpackedUserRoles,
    queryKey: [QueryKey.FindInterviewSlots],
    enabled: !!interviewer,
  });
}

export function useShareFeedback(
  interviewId: number
): UseMutationResult<IInterview.Self, Error, string, unknown> {
  const atlas = useAtlas();
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
  const atlas = useAtlas();

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
  const atlas = useAtlas();

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
  const atlas = useAtlas();
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
