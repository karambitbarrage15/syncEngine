import { generateSlug } from "random-word-slugs";
import z from "zod";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { PAGINATION } from "@/config/constants";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/generated/prisma";
import { Inngest } from "inngest";
import { inngest } from "@/inngest/client";
export const workflowsRouter = createTRPCRouter({
execute: protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId: workflow.id,
        userId: ctx.auth.user.id,
        initialData:{},
      },
    });

    // ✅ RETURN SOMETHING
    return workflow;
  }),

  /* ------------------------------------------------------------------ */
  /* Create Workflow (MULTIPLE DEFAULT NODES)                            */
  /* ------------------------------------------------------------------ */
  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,

        // ✅ CORRECT: nested createMany under `nodes`
        nodes: {
          create: 
           
              {
                type: NodeType.INITIAL,
                name: NodeType.INITIAL,
                position: { x: 0, y: 0 },
              
              
            
            
          },
        },
      },
    });
  }),

  /* ------------------------------------------------------------------ */
  /* Delete Workflow                                                     */
  /* ------------------------------------------------------------------ */
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
/* ------------------------------------------------------------------ */
/* Update Workflow Name ONLY                                           */
/* ------------------------------------------------------------------ */
updateName: protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return prisma.workflow.update({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
      data: {
        name: input.name,
      },
    });
  }),

  /* ------------------------------------------------------------------ */
  /* Update Workflow Name                                                */
  /* ------------------------------------------------------------------ */update: protectedProcedure
  .input(
    z.object({
      id: z.string(),

     nodes: z.array(
  z.object({
    id: z.string(),
    type: z.nativeEnum(NodeType).nullish(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.record(z.string(), z.any()).optional(),
  })
),


      edges: z.array(
        z.object({
          source: z.string(),
          target: z.string(),
          sourceHandle: z.string().nullish(),
          targetHandle: z.string().nullish(),
        })
      ),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, nodes, edges } = input;

    // Ensure workflow exists and belongs to user
    await prisma.workflow.findUniqueOrThrow({
      where: {
        id,
        userId: ctx.auth.user.id,
      },
    });

    return prisma.$transaction(async (tx) => {
      // 1️⃣ Delete old nodes
      await tx.node.deleteMany({
        where: {
          workflowId: id,
        },
      });

      // 2️⃣ Create new nodes
      await tx.node.createMany({
        data: nodes.map((node) => ({
          id: node.id,
          workflowId: id,
          name: node.type ?? "unknown",
          type: (node.type ?? NodeType.INITIAL) as NodeType,
          position: node.position,
          data: node.data ?? {},
        })),
      });

      // 3️⃣ Delete old connections
      await tx.connection.deleteMany({
        where: {
          workflowId: id,
        },
      });

      // 4️⃣ Create new connections
      await tx.connection.createMany({
        data: edges.map((edge) => ({
          workflowId: id,
          fromNodeId: edge.source,
          toNodeId: edge.target,
          fromOutput: edge.sourceHandle ?? "main",
          toInput: edge.targetHandle ?? "main",
        })),
      });

      // 5️⃣ Touch workflow updatedAt
      return tx.workflow.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    });
  }),


  /* ------------------------------------------------------------------ */
  /* Get One Workflow (Editor)                                           */
  /* ------------------------------------------------------------------ */
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) ?? {},
      }));

      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),

  /* ------------------------------------------------------------------ */
  /* Get Many Workflows (Pagination)                                     */
  /* ------------------------------------------------------------------ */
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    }),
});
  