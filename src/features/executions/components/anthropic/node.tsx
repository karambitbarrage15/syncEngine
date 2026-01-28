"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { UseNodeStatus } from "../../hooks/use-node-stauts";

import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";
import { fetchAnthropicRealtimeToken } from "./actions";
import { AnthropicDialog } from "./dialog";

type AnthropicNodeData = {
  variableName?: string;
  credentialId?:string;
  systemPrompts?: string;
  userPrompts?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo(
  (props: NodeProps<AnthropicNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = UseNodeStatus({
      nodeId: props.id,
      channel: ANTHROPIC_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchAnthropicRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: AnthropicNodeData) => {
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
      ? `"claude-3.5-sonnet": ${nodeData.userPrompts.slice(0, 50)}...`
      : "Not configured";

    return (
      <>
        <AnthropicDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/anthropic.svg"
          name="ANTHROPIC"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

AnthropicNode.displayName = "AnthropicNode";
