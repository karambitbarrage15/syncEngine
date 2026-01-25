import type { NodeExecutor } from "@/features/executions/components/types";

import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData=Record<string,unknown>;
export const stripeTriggerExecutor:NodeExecutor<StripeTriggerData>=async({
  data,
  nodeId,
  context,
  step,
  publish,
})=>{
//todo publish loading state for m
await publish(stripeTriggerChannel().status({
  nodeId,
  status:"loading",
}));
  const result=await step.run("stripe-trigger",async ()=>context);

  //todo publish succes
  await publish(stripeTriggerChannel().status({
  nodeId,
  status:"success",
}));
return result;
  
}