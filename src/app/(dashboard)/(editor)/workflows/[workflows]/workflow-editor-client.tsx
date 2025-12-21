"use client";

import { useParams } from "next/navigation";

export default function WorkflowEditorClient() {
  const params = useParams();

  const workflowId = params.workflows as string;

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
}
