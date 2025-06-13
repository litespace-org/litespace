import { useApi } from "@/api";
import { MutationKey, QueryKey } from "@/constants";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { OnError } from "@/types/query";
import { IFilter, IInvoice, Paginated, Void } from "@litespace/types";
import { Pagination } from "@litespace/types/dist/esm/filter";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

type OnSuccess = Void;

export type UseFindInvoicesPayload = { userOnly?: boolean } & Omit<
  IInvoice.FindInvoicesQuery,
  "page" | "size"
>;

export function useFindInvoices(
  filter: UseFindInvoicesPayload
): UsePaginateResult<IInvoice.Self> {
  const api = useApi();
  const findInvoices = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (filter.userOnly && !filter.users) return { list: [], total: 0 };
      return await api.invoice.find({ page, size, ...filter });
    },
    [api.invoice, filter]
  );
  return usePaginate(findInvoices, [QueryKey.FindInvoices, filter]);
}

export function useFindInvoicesByUser(
  id?: number
): UsePaginateResult<IInvoice.Self> {
  const api = useApi();

  const findInvoicesById = useCallback(
    async ({ page, size }: Pagination): Promise<Paginated<IInvoice.Self>> => {
      return await api.invoice.find({ page, size, users: id ? [id] : [] });
    },
    [api.invoice, id]
  );

  return usePaginate(findInvoicesById, [QueryKey.FindInvoicesByUser, id]);
}

type Query = UseQueryResult<IInvoice.StatsApiResponse | null, Error>;

export function useFindInvoiceStats(tutorId?: number): {
  query: Query;
  keys: unknown[];
} {
  const api = useApi();

  const findStats = useCallback(async () => {
    if (!tutorId) return null;
    return await api.invoice.stats(tutorId);
  }, [api.invoice, tutorId]);

  const keys = useMemo(() => [QueryKey.FindInvoiceStats], []);

  const query = useQuery({
    queryFn: findStats,
    queryKey: keys,
    enabled: !!tutorId,
  });

  return { query, keys };
}

export function useCreateInvoice({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const createUserInvoice = useCallback(
    async (payload: IInvoice.CreateApiPayload) => {
      return await api.invoice.create(payload);
    },
    [api.invoice]
  );

  return useMutation({
    mutationFn: createUserInvoice,
    mutationKey: [MutationKey.CreateInvoice],
    onSuccess,
    onError,
  });
}

export function useRequestInvoiceCancelation({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const cancelInvoice = useCallback(
    async (id: number) => {
      return await api.invoice.update(id, {
        status: IInvoice.Status.PendingCancellation,
      });
    },
    [api.invoice]
  );

  return useMutation({
    mutationFn: cancelInvoice,
    mutationKey: [MutationKey.RequestInvoiceCancellation],
    onSuccess,
    onError,
  });
}
