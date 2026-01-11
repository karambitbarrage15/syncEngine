"use client";
import {Node,NodeProps,useReactFlow} from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import {memo,useState} from  "react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { BaseHandle } from "@/components/react-flow/base-handle"; 
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode,BaseNodeContent } from "@/components/react-flow/base-node";
import { HttpRequestsFormValues, HttpRequestDialog } from "./dialog";
type HttpRequestNodeData={
  variableName?:string;
  endpoint?:string;
  method?:"GET"|"POST"|"PUT"|"PATCH"|"DELETE";
    body?:string;
   // [key:string]:unknown;

};
type HttpRequestNodeType=Node<HttpRequestNodeData>;


export const HttpRequestNode=memo((props:NodeProps<HttpRequestNodeType>)=>{
  const [dialogOpen,setDialogOpen]=useState(false);
  const {setNodes}=useReactFlow();
    const nodeStatus="initial";

    const handleOpenSettings=()=>setDialogOpen(true);
    const handleSubmit=(values:HttpRequestsFormValues)=>{
      setNodes((nodes)=>nodes.map((node)=>{
        if(node.id==props.id){
          return {
            ...node,
            data:{
              ...node.data,
              ...values,
            }
          }
        }
        return node;
      }))
    }
    
  const nodeData=props.data;
   const description = nodeData?.endpoint
  ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
  : "Not configured";

 
   return(
    <>
    <HttpRequestDialog 
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    onSubmit={handleSubmit}
    defaultValues={nodeData}
    />
    <BaseExecutionNode 
    {...props}
    id={props.id}
    icon={GlobeIcon}
    name="HTTP REQUEST"
    status={nodeStatus}
    description={description}
    onSettings={handleOpenSettings}
    onDoubleClick={handleOpenSettings}
 />
    </>
   )
}); 
HttpRequestNode.displayName="HttpRequestNode";
