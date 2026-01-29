"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { UseNodeStatus } from "../../hooks/use-node-stauts";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";
import { fetchDiscordRealtimeToken } from "./actions";

import { DiscordDialog } from "./dialog";

type DiscordNodeData = {
 webhookUrl?:string;
 variableName?:string;
 content?:string;
 username?:string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo(
  (props: NodeProps<DiscordNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = UseNodeStatus({
      nodeId: props.id,
      channel: DISCORD_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchDiscordRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: DiscordNodeData) => {
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
  ? `Content: ${nodeData.content.slice(0, 50)}${nodeData.content.length > 50 ? "..." : ""}`
  : "Not configured";


    return (
      <>
        <DiscordDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/discord.svg"
          name="DISCORD"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

DiscordNode.displayName = "DiscordNode";
