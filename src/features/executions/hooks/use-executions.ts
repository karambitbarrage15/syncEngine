"use client";

import { trpc } from "@/trpc/client";

import { useExecutionsParams } from "./use-executions-params";
import { useSuspenseQuery } from "@tanstack/react-query";
/* ------------------------------------------------------------------ */
/* Fetch Executions (Suspense)                                        */
/* ------------------------------------------------------------------ */

export const useSuspenseExecutions = () => {
  const [params] = useExecutionsParams();

  return trpc.executions.getMany.useSuspenseQuery(params);
};

/* ------------------------------------------------------------------ */
/* Fetch SINGLE Execution                                             */
/* ------------------------------------------------------------------ */

export const useSuspenseExecution = (id: string) => {
  return trpc.executions.getOne.useSuspenseQuery({ id });
};

