import type { Node, Connection } from "@xyflow/react";
import toposort from "toposort";
import { inngest } from "./client";

/**
 * Converts React Flow connections into a topologically sorted list of nodes.
 * Throws if a cycle exists.
 */
export function topologicalSort(
  nodes: Node[],
  connections: Connection[],
): Node[] {
  // No edges → no ordering constraints
  if (connections.length === 0) {
    return nodes;
  }

  /**
   * React Flow Connection:
   * source ───▶ target
   */
  const edges: [string, string][] = connections.map((c) => [
    c.source,
    c.target,
  ]);

  /**
   * Track which nodes appear in edges
   */
  const connectedNodeIds = new Set<string>();
  for (const [from, to] of edges) {
    connectedNodeIds.add(from);
    connectedNodeIds.add(to);
  }

  /**
   * Ensure isolated nodes are included
   */
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];

  try {
    sortedNodeIds = toposort(edges);
    // Remove duplicates caused by self-edges
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return sortedNodeIds
    .map((id) => nodeMap.get(id))
    .filter((n): n is Node => Boolean(n));
}

export const sendWorkflowExecution=async(data:{
  workflowId:string,
  [key:string]:any;

})=>{
  return inngest.send({
    name:"workflows/execute.workflow",data,
  })
}