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
*/import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    workflows: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  // ✅ THIS IS THE FIX
  const { workflows: workflowId } = await params;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600 }}>
        Workflow Editor
      </h1>

      <p style={{ marginTop: "12px" }}>
        Workflow ID: <strong>{workflowId}</strong>
      </p>
    </div>
  );
};

export default Page;
