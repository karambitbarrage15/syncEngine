"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,Panel
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { ErrorView, LoadingView } from "@/components/entity-views";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "@/app/atoms";
import { NodeType } from "@/generated/prisma";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

/* ------------------------------------------------------------------ */
/* Loading / Error                                                     */
/* ------------------------------------------------------------------ */

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

/* ------------------------------------------------------------------ */
/* Editor                                                             */
/* ------------------------------------------------------------------ */

export const Editor = ({ workflowId }: { workflowId: string }) => {
  // Suspense-based workflow fetch
  const [workflow] = useSuspenseWorkflow(workflowId);

  const setEditor=useSetAtom(editorAtom);
  // IMPORTANT: start empty (never initialize from async data)
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  /**
   * 🔥 CRITICAL:
   * Re-map backend edges into REAL React Flow Edge objects.
   * Never pass backend DTOs directly into state.
   */
  useEffect(() => {
    // Nodes are already safe
    setNodes(workflow.nodes);

    // Explicit edge sanitization
    const sanitizedEdges: Edge[] = workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      type: edge.type, // optional
    }));

    setEdges(sanitizedEdges);
  }, [workflow.nodes, workflow.edges]);

  /* ---------------------------- handlers --------------------------- */

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((prev) => applyNodeChanges(changes, prev));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((prev) => applyEdgeChanges(changes, prev));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prev) => addEdge(connection, prev));
    },
    []
  );

  /* ----------------------------- render ---------------------------- */
const hasManualTrigger=useMemo(()=>nodes.some((node)=>node.type===NodeType.MANUAL_TRIGGER),[nodes])
  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10,10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
       
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (<Panel position="bottom-center">
          <ExecuteWorkflowButton workflowId={workflowId}/>
          <AddNodeButton />
        </Panel>)}
      </ReactFlow>
    </div>
  );
};
