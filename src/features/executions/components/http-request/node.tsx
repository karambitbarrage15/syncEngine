"use client";
import {Node,NodeProps,useReactFlow} from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import {memo,useState} from  "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { BaseHandle } from "@/components/react-flow/base-handle"; 
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode,BaseNodeContent } from "@/components/react-flow/base-node";
type HttpRequestNodeData={
  endpoint?:string;
  method?:"GET"|"POST"|"PUT"|"PATCH"|"DELETE";
    body?:string;
    [key:string]:unknown;
};
type HttpRequestNodeType=Node<HttpRequestNodeData>;


export const HttpRequestNode=memo((props:NodeProps<HttpRequestNodeType>)=>{
  const nodeData=props.data as HttpRequestNodeData;
   const description=nodeData?.endpoint?`{nodeData.method||"GET"}:{nodeData.endpoint}`:"Not configured";
   return(
    <>
    <BaseExecutionNode 
    {...props}
    id={props.id}
    icon={GlobeIcon}
    name="HTTP REQUEST"
    description={description}
    onSettings={()=>{}}
    onDoubleClick={()=>{}}
 />
    </>
   )
}); 
HttpRequestNode.displayName="HttpRequestNode";
