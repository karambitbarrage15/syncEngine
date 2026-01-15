import type { NodeExecutor } from "@/features/executions/components/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
type ManualTriggerData=Record<string,unknown>;
export const manualTriggerExecutor:NodeExecutor<ManualTriggerData>=async({
  data,
  nodeId,
  context,
  step,
  publish,
})=>{
//todo publish loading state for manula trigger
await publish(manualTriggerChannel().status({
  nodeId,
  status:"loading",
}));
  const result=await step.run("manual-trigger",async ()=>context);

  //todo publish succes
  await publish(manualTriggerChannel().status({
  nodeId,
  status:"success",
}));
return result;
  
}