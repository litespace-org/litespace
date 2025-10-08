import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/api";
import { QueryKey } from "@/constants";
import { useSocket } from "@/socket";
import { ITransaction, Wss } from "@litespace/types";
import { useExtendedQuery } from "@/query";

export function useFindLastTransaction(config?: { enabled?: boolean }) {
  const api = useApi();

  const findLastTransaction = useCallback(async () => {
    return api.transaction.findLast();
  }, [api.transaction]);

  return useExtendedQuery({
    queryFn: findLastTransaction,
    queryKey: [QueryKey.FindLastTransaction],
    enabled: config?.enabled,
  });
}

type TransactionStatusUpdate = {
  transactionId: number;
  status: ITransaction.Status;
};

export function useTransactionStatus(txId?: number) {
  const { socket } = useSocket();
  const [updates, setUpdates] = useState<TransactionStatusUpdate[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.TransactionStatusUpdate, (update) => {
      if (txId && update.transactionId !== txId) return;
      setUpdates((prev) => [...prev, update]);
    });
    return () => {
      socket.off(Wss.ServerEvent.TransactionStatusUpdate);
    };
  }, [socket, setUpdates, txId]);

  return { updates };
}
