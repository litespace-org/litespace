import { useAtlas } from "@/atlas";
import { MutationKey, QueryKey } from "@/constants";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { useInfinitePaginationQuery } from "@/query";
import { IFilter, IInvoice, Paginated, Void } from "@litespace/types";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { OnError } from "@/types/query";

type OnSuccess = Void;

export type UseFindInvoicesPayload = { userOnly?: boolean } & Omit<
  IInvoice.FindInvoicesQuery,
  "page" | "size"
>;

export function useFindInvoices(
  filter: UseFindInvoicesPayload
): UsePaginateResult<IInvoice.Self> {
  const atlas = useAtlas();
  const findInvoices = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (filter.userOnly && !filter.users) return { list: [], total: 0 };
      return await atlas.invoice.find({ page, size, ...filter });
    },
    [atlas.invoice, filter]
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
  const atlas = useAtlas();
  const findInvoices = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<Paginated<IInvoice.Self>> => {
      if (filter.userOnly && !filter.users) return { list: [], total: 0 };
      return await atlas.invoice.find({
        users: filter.users,
        page: pageParam,
        ...filter,
      });
    },
    [atlas.invoice, filter]
  );
  return useInfinitePaginationQuery(findInvoices, [
    QueryKey.FindInvoicesByUser,
    filter,
  ]);
}

type useFindInvoiceStatsProps = UseQueryResult<
  IInvoice.StatsApiResponse | null,
  Error
>;

export function useFindInvoiceStats(
  tutorId?: number
): useFindInvoiceStatsProps {
  const atlas = useAtlas();

  const findStats = useCallback(async () => {
    if (!tutorId) return null;
    return await atlas.invoice.stats(tutorId);
  }, [atlas.invoice, tutorId]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindInvoiceStats],
    enabled: !!tutorId,
  });
}

export function useFindWithdrawalMethods() {
  const atlas = useAtlas();

  const findWithdrawalMethods = useCallback(() => {
    return atlas.withdrawMethod.find();
  }, [atlas.withdrawMethod]);

  return useQuery({
    queryFn: findWithdrawalMethods,
    queryKey: [QueryKey.FindWithdrawalMethods],
  });
}

export function useCreateInvoice({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}): UseMutationResult<
  IInvoice.Self,
  Error,
  IInvoice.CreateApiPayload,
  unknown
> {
  const atlas = useAtlas();

  const createUserInvoice = useCallback(
    async (payload: IInvoice.CreateApiPayload) => {
      return await atlas.invoice.create(payload);
    },
    [atlas.invoice]
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
  const atlas = useAtlas();
  const updateUserInvoice = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IInvoice.UpdateByReceiverApiPayload;
    }) => {
      return await atlas.invoice.updateByReceiver(id, payload);
    },
    [atlas.invoice]
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
  const atlas = useAtlas();

  const cancel = useCallback(async () => {
    return await atlas.invoice.updateByReceiver(id, {
      cancel: true,
    });
  }, [atlas.invoice, id]);

  return useMutation({
    mutationFn: cancel,
    mutationKey: [MutationKey.CancelInvoice],
    onSuccess,
    onError,
  });
}
