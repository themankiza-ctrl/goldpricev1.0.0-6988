import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

const KEY_STORAGE = "gf-admin-key";

export function getAdminKey() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(KEY_STORAGE);
}

export function setAdminKey(key: string | null) {
  if (key) window.localStorage.setItem(KEY_STORAGE, key);
  else window.localStorage.removeItem(KEY_STORAGE);
}

export function useAdminLogin() {
  return useMutation(orpc.admin.login.mutationOptions());
}

export function useAdminSettings(enabled: boolean) {
  return useQuery(orpc.admin.settings.queryOptions({ enabled, staleTime: 10_000 }));
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        queryClient.invalidateQueries({ queryKey: orpc.prices.key() });
        queryClient.invalidateQueries({ queryKey: orpc.spot.key() });
      },
    }),
  );
}

export function useAdminProducts(enabled: boolean) {
  return useQuery(orpc.admin.products.queryOptions({ enabled, staleTime: 10_000 }));
}

function useProductMutation<T extends "updateProduct" | "createProduct" | "deleteProduct">(name: T) {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin[name].mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        queryClient.invalidateQueries({ queryKey: orpc.prices.key() });
      },
    }),
  );
}

export function useUpdateProduct() {
  return useProductMutation("updateProduct");
}

export function useCreateProduct() {
  return useProductMutation("createProduct");
}

export function useDeleteProduct() {
  return useProductMutation("deleteProduct");
}
