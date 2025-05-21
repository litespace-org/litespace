import { useApi } from "@/api";
import { MutationKey, QueryKey } from "@/constants";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { useInfinitePaginationQuery } from "@/query";
import { IFilter, IInvoice, Paginated, Void } from "@litespace/types";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { OnError } from "@/types/query";

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

type useFindInvoicesByUserProps = {
  query: UseInfiniteQueryResult<
    InfiniteData<Paginated<IInvoice.Self>, unknown>,
    Error
  >;
  list: IInvoice.Self[] | null;
  more: Void;
};

export function useFindInvoicesByUser(
  filter: { userOnly?: boolean } & Omit<
    IInvoice.FindInvoicesQuery,
    "page" | "size"
  >
): useFindInvoicesByUserProps {
  const api = useApi();
  const findInvoices = useCallback(
    async ({ page }: { page: number }): Promise<Paginated<IInvoice.Self>> => {
      if (filter.userOnly && !filter.users) return { list: [], total: 0 };
      return await api.invoice.find({
        page,
        users: filter.users,
        ...filter,
      });
    },
    [api.invoice, filter]
  );
  return useInfinitePaginationQuery(findInvoices, [
    QueryKey.FindInvoicesByUser,
    filter,
  ]);
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

export function useFindWithdrawalMethods() {
  const api = useApi();

  const findWithdrawalMethods = useCallback(() => {
    return api.withdrawMethod.find();
  }, [api.withdrawMethod]);

  const keys = useMemo(() => [QueryKey.FindWithdrawalMethods], []);

  const query = useQuery({
    queryFn: findWithdrawalMethods,
    queryKey: keys,
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

export function useEditUserInvoice({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();
  const updateUserInvoice = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IInvoice.UpdateByReceiverApiPayload;
    }) => {
      return await api.invoice.updateByReceiver(id, payload);
    },
    [api.invoice]
  );
  return useMutation({
    mutationFn: updateUserInvoice,
    mutationKey: [MutationKey.EditInvoice],
    onSuccess,
    onError,
  });
}

export function useCancelInvoiceById({
  id,
  onSuccess,
  onError,
}: {
  id: number;
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const cancel = useCallback(async () => {
    return await api.invoice.updateByReceiver(id, {
      cancel: true,
    });
  }, [api.invoice, id]);

  return useMutation({
    mutationFn: cancel,
    mutationKey: [MutationKey.CancelInvoice],
    onSuccess,
    onError,
  });
}
