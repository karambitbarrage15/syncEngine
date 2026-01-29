"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { UseNodeStatus } from "../../hooks/use-node-stauts";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";
import { fetchSlackRealtimeToken } from "./actions";

import { SlackDialog } from "./dialog";

/* ---------------- Types ---------------- */

type SlackNodeData = {
  webhookUrl?: string;
  variableName?: string;
  content?: string;
  username?: string;
};

type SlackNodeType = Node<SlackNodeData>;

/* ---------------- Component ---------------- */

export const SlackNode = memo(
  (props: NodeProps<SlackNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = UseNodeStatus({
      nodeId: props.id,
      channel: SLACK_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchSlackRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: SlackNodeData) => {
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

    const description = nodeData?.content
      ? `Text: ${nodeData.content.slice(0, 50)}${
          nodeData.content.length > 50 ? "..." : ""
        }`
      : "Not configured";

    return (
      <>
        <SlackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/slack.svg"
          name="SLACK"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

SlackNode.displayName = "SlackNode";
