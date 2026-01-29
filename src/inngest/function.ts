import { anthropic, NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import type { Node, Connection } from "@xyflow/react";
import { NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/components/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/goggle-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries:0,//Todo:remove for production
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
      discordChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow id is missing");
    }

    /* -----------------------------
       PREPARE WORKFLOW (DAG)
    ------------------------------ */
    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId,
          status:"PUBLISHED",
         },
        include: {
          nodes: true,
          connections: true,
        },
      });
if(!workflow){
  throw new NonRetriableError(`Workflow ${workflowId} not found or not published`);
}
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type as NodeType,
        position:
          (node.position as { x: number; y: number }) ?? { x: 0, y: 0 },
        data: (node.data as Record<string, unknown>) ?? {},
      }));

      const connections: Connection[] = workflow.connections.map((c) => ({
        source: c.fromNodeId,
        target: c.toNodeId,
        sourceHandle: c.fromOutput,
        targetHandle: c.toInput,
      }));

      return topologicalSort(nodes, connections);
    });
    //toprevent from injections
    const userId=await step.run("find-user-id",async()=>{
      const workflow=await prisma.workflow.findUniqueOrThrow({
        where:{id:workflowId},
        select:{
          userId:true,
        }
      })
      return workflow.userId;
    })

    /* -----------------------------
       EXECUTE WORKFLOW
    ------------------------------ */
    let context: Record<string, unknown> =
      event.data.initialData ?? {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);

      // 🔔 NODE STARTED
      await publish({
        channel: "http-request",
        topic: "workflow/node.started",
        data: {
          workflowId,
          nodeId: node.id,
          nodeType: node.type,
        },
      });

      try {
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          userId,
          publish,
        });

        // 🔔 NODE COMPLETED
        await publish({
          channel: "http-request",
          topic: "workflow/node.completed",
          data: {
            workflowId,
            nodeId: node.id,
            context,
          },//jointly-incretionary-arlena.ngrok-free.dev
        });
      } catch (error) {
        // 🔔 NODE FAILED
        await publish({
          channel: "http-request",
          topic: "workflow/node.failed",
          data: {
            workflowId,
            nodeId: node.id,
            error:
              error instanceof Error
                ? error.message
                : "Unknown error",
          },
        });

        throw error;
      }
    }

    /* -----------------------------
       FINAL RESULT (THIS WAS MISSING)
    ------------------------------ */
    return {
      workflowId,
      result: context,
    };
  }
);
