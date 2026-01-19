import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { GoogleFormTriggerDialog } from "./dialog"
import { useState } from "react";

import { fetchGoogleFormRealtimeToken } from "./actions";
import { UseNodeStatus } from "@/features/executions/hooks/use-node-stauts";
import { GOOGLE_FORM_CHANNEL_NAME } from "@/inngest/channels/goggle-form-trigger copy";
export const GoogleFormTrigger=memo((props:NodeProps)=>{
  const [dialogOpen,setDialogOpen]=useState(false);
  
    const nodeStatus=UseNodeStatus({
          nodeId:props.id,
          channel:GOOGLE_FORM_CHANNEL_NAME,
          topic:"status",
          refreshToken:fetchGoogleFormRealtimeToken,
        });
  const handleOpenSettings=()=>setDialogOpen(true);
return (
<>
<GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
<BaseTriggerNode 
{...props}
icon="/logos/googleform.svg"

name="When form is submitted"
description="Google Form"
status={nodeStatus}
onSettings={handleOpenSettings}
onDoubleClick={handleOpenSettings}
/>

</>

)

});