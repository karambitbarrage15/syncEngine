'use client';

import { trpc } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "./use-workflows-params";

type Router = ReturnType<typeof useRouter>;

export const useCreateWorkflow = (router: Router) => {
  const queryClient = useQueryClient();

  return trpc.workflows.create.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Workflow "${data.name}" created`);

      router.push(`/workflows/${data.id}`);

      // ✅ CORRECT invalidation for proxy-based tRPC client
      queryClient.invalidateQueries({
        queryKey: [["workflows", "getMany"]],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create Workflow: ${error.message}`);
    },
  });
};

export const useSuspenseWorkflows = () => {
  const [params] = useWorkflowsParams(); 
  return trpc.workflows.getMany.useSuspenseQuery(params);
};
