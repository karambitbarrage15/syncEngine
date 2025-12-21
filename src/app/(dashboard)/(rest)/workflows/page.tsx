import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient, prefetch } from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { Workflow } from "lucide-react";
import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";

 const Page = async () => {
  await requireAuth();

  await prefetchWorkflows(undefined);

  return (
    <WorkflowsContainer>
    <HydrateClient>
      <ErrorBoundary fallback={<p>Error!</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <WorkflowsList />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
