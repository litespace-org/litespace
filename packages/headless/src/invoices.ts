import { IFilter, IInvoice, IUser, Paginated, Void } from "@litespace/types";
import { useCallback } from "react";
import { useAtlas } from "@/atlas";
import { useInfinitePaginationQuery } from "@/query";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { UsePaginateResult, usePaginate } from "@/pagination";

type OnSuccess = Void;
type OnError = (error: Error) => void;

type UseFindInvoicesPayload = { userOnly?: boolean } & Omit<
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
      return await atlas.invoice.find({ page, size });
    },
    [atlas.invoice, filter.userOnly, filter.users]
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
  profile: IUser.Self | null
): useFindInvoiceStatsProps {
  const atlas = useAtlas();

  const findStats = useCallback(async () => {
    if (!profile) return null;
    return await atlas.invoice.stats(profile.id);
  }, [atlas.invoice, profile]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindInvoiceStats],
    enabled: !!profile,
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
