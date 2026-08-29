import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Public config for the lock dialog: phone, allowed windows, ceiling. */
export function useLockConfig() {
  return useQuery(orpc.locks.config.queryOptions({ staleTime: 300_000 }));
}

export function useCreateLock() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.locks.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.locks.key() }),
    }),
  );
}

/** Operator inbox — polls so a new request shows up without a reload. */
export function useLocks(status: "all" | "aktivan" | "potvrdjen" | "otkazan" | "istekao") {
  return useQuery(
    orpc.locks.list.queryOptions({
      input: { status, limit: 200 },
      refetchInterval: 30_000,
    }),
  );
}

export function useSetLockStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.locks.setStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.locks.key() }),
    }),
  );
}

export function usePurgeLocks() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.locks.purge.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.locks.key() }),
    }),
  );
}
