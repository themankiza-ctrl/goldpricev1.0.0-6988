import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/* ------------------------------------------------------------------- javno */

export function useAlertConfig() {
  return useQuery(orpc.alerts.config.queryOptions({ staleTime: 60_000 }));
}

export function useSubscribeAlert() {
  return useMutation(orpc.alerts.subscribe.mutationOptions());
}

export function useConfirmAlert(token: string | null) {
  return useQuery(
    orpc.alerts.confirm.queryOptions({
      input: { token: token ?? "" },
      enabled: !!token,
      retry: false,
      staleTime: Infinity,
    }),
  );
}

export function useUnsubscribeAlert(token: string | null) {
  return useQuery(
    orpc.alerts.unsubscribe.queryOptions({
      input: { token: token ?? "" },
      enabled: !!token,
      retry: false,
      staleTime: Infinity,
    }),
  );
}

/* ------------------------------------------------------------------- admin */

export function useAlertSubscribers(
  status: "all" | "pending" | "aktivan" | "ispunjen" | "odjavljen",
) {
  return useQuery(
    orpc.alerts.list.queryOptions({ input: { status, limit: 200 }, refetchInterval: 60_000 }),
  );
}

export function useAlertLog() {
  return useQuery(orpc.alerts.log.queryOptions({ input: { limit: 80 }, refetchInterval: 60_000 }));
}

export function useAlertStatus() {
  return useQuery(orpc.alerts.status.queryOptions({ refetchInterval: 60_000 }));
}

function useInvalidateAlerts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.alerts.key() });
}

export function useAlertTestSend() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.testSend.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertRunNow() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.runNow.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertResetRefs() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.resetRefs.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertSetStatus() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.setStatus.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertPurge() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.purge.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertResendConfirm() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.resendConfirm.mutationOptions({ onSuccess: invalidate }));
}

export function useAlertVerifySmtp() {
  const invalidate = useInvalidateAlerts();
  return useMutation(orpc.alerts.verifySmtp.mutationOptions({ onSuccess: invalidate }));
}
