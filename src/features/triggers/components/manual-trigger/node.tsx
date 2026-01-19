import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog"
import { useState } from "react";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";
import { fetchManulaTriggerRealtimeToken } from "./actions";
import { UseNodeStatus } from "@/features/executions/hooks/use-node-stauts";
export const ManualTriggerNode=memo((props:NodeProps)=>{
  const [dialogOpen,setDialogOpen]=useState(false);
  const nodeStatus=UseNodeStatus({
        nodeId:props.id,
        channel:MANUAL_TRIGGER_CHANNEL_NAME,
        topic:"status",
        refreshToken:fetchManulaTriggerRealtimeToken,
      });
  const handleOpenSettings=()=>setDialogOpen(true);
return (
<>
<ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
<BaseTriggerNode 
{...props}
icon={MousePointerIcon}
name="When clicking 'Execute workflow'"
status={nodeStatus}
onSettings={handleOpenSettings}
onDoubleClick={handleOpenSettings}
/>

</>

)

});