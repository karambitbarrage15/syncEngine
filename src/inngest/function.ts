import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import type { Node, Connection } from "@xyflow/react";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
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
    retries: 0,

    // ✅ SINGLE SOURCE OF FAILURE HANDLING
    onFailure: async ({ event }) => {
      return prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id, // original event id
        },
        data: {
          status: ExecutionStatus.FAILED,
          completeAt: new Date(),
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
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
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId) {
      throw new NonRetriableError("Inngest event id is missing");
    }

    if (!workflowId) {
      throw new NonRetriableError("Workflow id is missing");
    }

    /* -----------------------------
       CREATE EXECUTION
    ------------------------------ */
    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
          status: ExecutionStatus.RUNNING,
          startedAt: new Date(),
        },
      });
    });

    let context: Record<string, any> = event.data.initialData ?? {};

    /* -----------------------------
       PREPARE WORKFLOW
    ------------------------------ */
    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          status: "PUBLISHED",
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!workflow) {
        throw new NonRetriableError(
          `Workflow ${workflowId} not found or not published`
        );
      }

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type as NodeType,
        position:
          (node.position as { x: number; y: number }) ?? { x: 0, y: 0 },
        data: (node.data as Record<string, any>) ?? {},
      }));

      const connections: Connection[] = workflow.connections.map((c) => ({
        source: c.fromNodeId,
        target: c.toNodeId,
        sourceHandle: c.fromOutput,
        targetHandle: c.toInput,
      }));

      return topologicalSort(nodes, connections);
    });

    /* -----------------------------
       USER ID
    ------------------------------ */
    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
      return workflow.userId;
    });

    /* -----------------------------
       EXECUTE WORKFLOW
    ------------------------------ */
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);

      await publish({
        channel: "http-request",
        topic: "workflow/node.started",
        data: {
          workflowId,
          nodeId: node.id,
          nodeType: node.type,
        },
      });

      context = await executor({
        data: node.data as Record<string, any>,
        nodeId: node.id,
        context,
        step,
        userId,
        publish,
      });

      await publish({
        channel: "http-request",
        topic: "workflow/node.completed",
        data: {
          workflowId,
          nodeId: node.id,
          context,
        },
      });
    }

    /* -----------------------------
       SUCCESS
    ------------------------------ */
    await step.run("update-execution-success", async () => {
      return prisma.execution.update({
        where: { inngestEventId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completeAt: new Date(),
          output: context as any,
        },
      });
    });

    return { workflowId, result: context };
  }
);
