"use client";

import { ErrorView, LoadingView } from "@/components/entity-views";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  // ✅ Fetch ONLY the workflow that was clicked
  const [workflow] = useSuspenseWorkflow(workflowId);

  return (
    <pre className="p-4 text-sm">
      {JSON.stringify(workflow, null, 2)}
    </pre>
  );
};
