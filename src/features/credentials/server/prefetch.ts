import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";
import { useSuspenseQuery } from "@tanstack/react-query";

type Input = inferInput<typeof trpc.credentails.getMany>;

/**
 * Prefetch all credentials
 */
export const prefetchCredentials = (params: Input = {}) => {
  return prefetch(
    trpc.credentails.getMany.queryOptions(params)
  );
};

/**
 * Prefetch single credential
 */
export const prefetchCredential = (id: string) => {
  return prefetch(
    trpc.credentails.getOne.queryOptions({ id })
  );
};

/**
 * Suspense hook for single credential (server usage)
 */
export const useSuspenseCredential = (id: string) => {
  return useSuspenseQuery(
    trpc.credentails.getOne.queryOptions({ id })
  );
};
