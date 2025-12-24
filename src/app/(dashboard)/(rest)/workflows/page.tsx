import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient, prefetch } from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { Workflow } from "lucide-react";
import { WorkflowsContainer, WorkflowsList, WorkflowsLoading ,WorkflowsError} from "@/features/workflows/components/workflows";
import type { SearchParams } from "nuqs";
import { workflowsParams } from "@/features/workflows/params";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";

type Props={
  searchParams:Promise<SearchParams>
}
 const Page = async ({searchParams}:Props) => {
  await requireAuth();
const params=await workflowsParamsLoader(searchParams);
   prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
    <HydrateClient>
      <ErrorBoundary fallback={<WorkflowsError />}>
        <Suspense fallback={<WorkflowsLoading />}>
          <WorkflowsList />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
