/*import { requireAuth } from "@/lib/auth-utils";
interface PageProps {
  params: Promise<{
    workflowId: string;  // Fixed spelling
  }>;
};

const Page = async ({ params }: PageProps) => {
    await requireAuth();
  const { workflowId } = await params;
  
  return (
    <div>
     
      <p>Workflow ID: {workflowId}</p>
    </div>
  );
}

export default Page;*
import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: {
    workflows: string;
  };
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const workflowId = params.workflows;

  return (
    <div>
      Workflow ID: {workflowId}
    </div>
  );
};


export default Page;
/import { requireAuth } from "@/lib/auth-utils";
import WorkflowEditorClient from "./workflow-editor-client";

const Page = async () => {
  await requireAuth();
  return <WorkflowEditorClient />;
};

export default Page;
*/import { Editor, EditorError, EditorLoading } from "@/features/editor/components/editor";
import { EditorHeader } from "./editor-header";
import { WorkflowsError, WorkflowsLoading } from "@/features/workflows/components/workflows";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Workflow } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    workflows: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  // ✅ THIS IS THE FIX
  const { workflows: workflowId } = await params;
prefetchWorkflow(workflowId);
  return (<HydrateClient>
    <ErrorBoundary fallback={<EditorError />}>
    <Suspense fallback={<EditorLoading />}>
    <EditorHeader workflowId={workflowId}/>
   <main className="flex-1"><Editor workflowId={workflowId} /></main>
    </Suspense>

    </ErrorBoundary>
  </HydrateClient>
    
  );
};

export default Page;
