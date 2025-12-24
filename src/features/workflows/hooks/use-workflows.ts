"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "./use-workflows-params";

/* ------------------------------------------------------------------ */
/* Create Workflow */
/* ------------------------------------------------------------------ */

export const useCreateWorkflow = () => {
  const router = useRouter();
  const utils = trpc.useUtils(); // ✅ tRPC cache utils

  return trpc.workflows.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Workflow "${data.name}" created`);

      router.push(`/workflows/${data.id}`);

      // ✅ proper tRPC invalidation
      utils.workflows.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create Workflow: ${error.message}`);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Fetch Workflows (Suspense) */
/* ------------------------------------------------------------------ */

export const useSuspenseWorkflows = () => {
  const [params] = useWorkflowsParams();

  return trpc.workflows.getMany.useSuspenseQuery(params);
};

/* ------------------------------------------------------------------ */
/* Remove Workflow */
/* ------------------------------------------------------------------ */

export const useRemoveWorkflow = () => {
  const utils = trpc.useUtils();

  return trpc.workflows.remove.useMutation({
    onSuccess: (data) => {
      toast.success(`Workflow "${data.name}" removed`);

      // ✅ invalidate lists
      utils.workflows.getMany.invalidate();

      // ✅ invalidate detail page cache
      utils.workflows.getOne.invalidate({ id: data.id });
    },
    onError: (error) => {
      toast.error(`Failed to remove Workflow: ${error.message}`);
    },
  });
};
