import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { IRule, Void } from "@litespace/types";
import { QueryKey } from "@/constants";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useCreateRule({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createRule = useCallback(
    async (payload: IRule.CreateApiPayload) => {
      return await atlas.rule.create(payload);
    },
    [atlas.rule]
  );

  return useMutation({
    mutationFn: createRule,
    onSuccess,
    onError,
  });
}

export function useEditRule({
  rule,
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  rule: IRule.Self | undefined;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const updateRule = useCallback(
    async (payload: IRule.UpdateApiPayload) => {
      if (!rule) return;
      return await atlas.rule.update(rule.id, payload);
    },
    [atlas.rule, rule]
  );

  return useMutation({
    mutationFn: updateRule,
    onSuccess,
    onError,
  });
}

export function useDeactivateRule({
  rule,
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  rule: IRule.Self | undefined;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const deactivateRule = useCallback(async () => {
    if (rule) return await atlas.rule.update(rule.id, { activated: false });
  }, [atlas.rule, rule]);

  return useMutation({
    mutationFn: deactivateRule,
    onSuccess,
    onError,
  });
}

export function useDeleteRule({
  rule,
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  rule: IRule.Self | undefined;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const deleteRules = useCallback(async () => {
    if (rule) return await atlas.rule.delete(rule.id);
  }, [atlas.rule, rule]);

  return useMutation({
    mutationFn: deleteRules,
    onSuccess,
    onError,
  });
}

export function useFindUserRulesWithSlots(
  payload: IRule.FindRulesWithSlotsApiQuery
) {
  const atlas = useAtlas();

  const findRules = useCallback(() => {
    return atlas.rule.findUserRulesWithSlots(payload);
  }, [payload, atlas.rule]);

  return useQuery({
    queryFn: findRules,
    queryKey: [QueryKey.FindRulesWithSlots],
  });
}
