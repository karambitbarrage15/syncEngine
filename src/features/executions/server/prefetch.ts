import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";
import { useSuspenseQuery } from "@tanstack/react-query";

type Input = inferInput<typeof trpc.executions.getMany>;

/**
 * Prefetch all Executions
 */
export const prefetchExecutions = (params: Input = {}) => {
  return prefetch(
    trpc.executions.getMany.queryOptions(params)
  );
};

/**
 * Prefetch single Execution
 */
export const prefetchExecution = (id: string) => {
  return prefetch(
    trpc.executions.getOne.queryOptions({ id })
  );
};

/**
 * Suspense hook for single Execution (server usage)
 */
export const useSuspenseExecution = (id: string) => {
  return useSuspenseQuery(
    trpc.executions.getOne.queryOptions({ id })
  );
};
