import { useApi } from "@/api";
import { OnError, OnSuccess } from "@/types/query";
import { IReport } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export function useCreateReport({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const createReport = useCallback(
    async (payload: IReport.CreateApiPayload & IReport.CreateApiFiles) => {
      return api.report.create(payload);
    },
    [api.report]
  );

  return useMutation({
    mutationFn: createReport,
    onSuccess,
    onError,
  });
}
