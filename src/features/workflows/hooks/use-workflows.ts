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
/* Fetch SINGLE Workflow (EDITOR – Suspense) ✅ IMPORTANT */
/* ------------------------------------------------------------------ */

export const useSuspenseWorkflow = (id: string) => {
  return trpc.workflows.getOne.useSuspenseQuery({ id });
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
};/**hook to update a workflow name */
export const useUpdateWorkflowName = () => {
  const router = useRouter();
  const utils = trpc.useUtils(); // ✅ tRPC cache utils

  return trpc.workflows.updateName.useMutation({
    onSuccess: (data) => {
      toast.success(`Workflow "${data.name}" updated`);

      router.push(`/workflows/${data.id}`);

      // ✅ proper tRPC invalidation
      utils.workflows.getMany.invalidate(); 
      utils.workflows.getOne.invalidate({id:data.id});
      
    },
    onError: (error) => {
      toast.error(`Failed to update Workflow: ${error.message}`);
    },
  });
};
/**hook to update  a workflow */
export const useUpdateWorkflow = () => {
  const router = useRouter();
  const utils = trpc.useUtils(); // ✅ tRPC cache utils

  return trpc.workflows.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Workflow "${data.name}" saved`);

      router.push(`/workflows/${data.id}`);

      // ✅ proper tRPC invalidation
      utils.workflows.getMany.invalidate(); 
      utils.workflows.getOne.invalidate({id:data.id});
      
    },
    onError: (error) => {
      toast.error(`Failed to save Workflow: ${error.message}`);
    },
  });
};


/**hook to execute a workflow */
export const useExecuteWorkflow = () => {
  const router = useRouter();
  const utils = trpc.useUtils(); // ✅ tRPC cache utils

  return trpc.workflows.execute.useMutation({
    onSuccess: (data) => {
      toast.success(`Workflow "${data.name}" executed`);

      
    },
    onError: (error) => {
      toast.error(`Failed to execute Workflow: ${error.message}`);
    },
  });
};