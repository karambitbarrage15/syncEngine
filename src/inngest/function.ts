import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import type { Node, Connection } from "@xyflow/react";
import { NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/components/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
  },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow id is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      /* -----------------------------
         DB → React Flow NODE mapping
      ------------------------------ */
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type as NodeType,
        position: (node.position as { x: number; y: number }) ?? {
          x: 0,
          y: 0,
        },
        data: (node.data as Record<string, unknown>) ?? {},
      }));

      /* -----------------------------
         DB → React Flow CONNECTION mapping
      ------------------------------ */
      const connections: Connection[] = workflow.connections.map((c) => ({
        source: c.fromNodeId,
        target: c.toNodeId,
        sourceHandle: c.fromOutput,
        targetHandle: c.toInput,
      }));

      return topologicalSort(nodes, connections);
    });
let context=event.data.initialData||{};
for(const node of sortedNodes)
{
  const executor =getExecutor(node.type as NodeType);
}
    return { workflowId,
      result:context
     };
  }
);
  