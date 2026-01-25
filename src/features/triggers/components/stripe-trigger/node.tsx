import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { StripeTriggerDialog } from "./dialog"
import { useState } from "react";

import { fetchStripeTriggerRealtimeToken  } from "./actions";
import { UseNodeStatus } from "@/features/executions/hooks/use-node-stauts";

import { fetch } from "inngest";
import { STRIPE_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";
export const StripeTriggerNode  =memo((props:NodeProps)=>{
  const [dialogOpen,setDialogOpen]=useState(false);
  
    const nodeStatus=UseNodeStatus({
          nodeId:props.id,
          channel:STRIPE_CHANNEL_NAME,
          topic:"status",
          refreshToken:fetchStripeTriggerRealtimeToken,
        });
  const handleOpenSettings=()=>setDialogOpen(true);
return (
<>
<StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
<BaseTriggerNode 
{...props}
icon="/logos/stripe.svg"

name="Stripe"
description="When stripe event is captured"
status={nodeStatus}
onSettings={handleOpenSettings}
onDoubleClick={handleOpenSettings}
/>

</>

)

});