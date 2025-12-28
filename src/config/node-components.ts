import {NodeType} from "@/generated/prisma";
import {NodeTypes} from "@xyflow/react";
import { InitialNode } from "@/components/intial-node";
export const nodeComponents={
  [NodeType.INITIAL]:InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType=keyof typeof nodeComponents;