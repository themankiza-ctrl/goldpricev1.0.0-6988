import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "../../api";

const link = new RPCLink({
  url: `${window.location.origin}/api/rpc`,
  /** Admin procedures are gated by the operator password kept in localStorage. */
  headers: () => {
    const key = window.localStorage.getItem("gf-admin-key");
    return key ? { "x-admin-key": key } : {};
  },
});

/** Direct typed client: await client.ping() */
export const client: AppRouterClient = createORPCClient(link);

/** TanStack Query helpers: useQuery(orpc.ping.queryOptions()) */
export const orpc = createTanstackQueryUtils(client);
