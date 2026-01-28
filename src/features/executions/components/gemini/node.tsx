"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { UseNodeStatus } from "../../hooks/use-node-stauts";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { fetchGeminiRealtimeToken } from "./actions";

import { GeminiDialog } from "./dialog";

type GeminiNodeData = {
  variableName?: string;
credentialId?:string;
  systemPrompts?: string;
  userPrompts?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo(
  (props: NodeProps<GeminiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = UseNodeStatus({
      nodeId: props.id,
      channel: GEMINI_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchGeminiRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: GeminiNodeData) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...values,
                },
              }
            : node
        )
      );
    };

    const nodeData = props.data;

    const description = nodeData?.userPrompts
      ? `"gemini-2.0-flash": ${nodeData.userPrompts.slice(
          0,
          50
        )}...`
      : "Not configured";

    return (
      <>
        <GeminiDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/gemini.svg"
          name="GEMINI"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

GeminiNode.displayName = "GeminiNode";
