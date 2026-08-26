import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Live spot header. Polls on the same cadence the server refreshes on. */
export function useSpot() {
  return useQuery(
    orpc.spot.current.queryOptions({
      refetchInterval: 30_000,
      staleTime: 15_000,
    }),
  );
}

export function useSpotHistory(hours: number) {
  return useQuery(orpc.spot.history.queryOptions({ input: { hours }, staleTime: 60_000 }));
}

export function usePriceList() {
  return useQuery(
    orpc.prices.list.queryOptions({
      refetchInterval: 30_000,
      staleTime: 15_000,
    }),
  );
}

export function useQuote(input: {
  metal: "XAU" | "XAG";
  weightG: number;
  fineness: number;
  sku?: string;
}) {
  return useQuery(
    orpc.prices.quote.queryOptions({
      input,
      enabled: input.weightG > 0,
      staleTime: 15_000,
    }),
  );
}

export function useSnapshotAll() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.prices.snapshotAll.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.prices.key() }),
    }),
  );
}

export function usePriceHistory(sku?: string) {
  return useQuery(orpc.prices.history.queryOptions({ input: { sku, limit: 60 } }));
}
