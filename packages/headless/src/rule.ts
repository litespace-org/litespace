import { useMutation } from "@tanstack/react-query";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { IRule, Void } from "@litespace/types";

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
  const createRule = useCallback(async (payload: IRule.CreateApiPayload) => {
    return await atlas.rule.create(payload);
  }, []);
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
    [rule]
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
  }, [rule?.id]);

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
  }, [rule?.id]);

  return useMutation({
    mutationFn: deleteRules,
    onSuccess,
    onError,
  });
}
