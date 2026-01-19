import type { NodeExecutor } from "@/features/executions/components/types";
import { googleFormTriggerChannel } from "@/inngest/channels/goggle-form-trigger copy";

type GoogleFormTriggerData=Record<string,unknown>;
export const googleFormTriggerExecutor:NodeExecutor<GoogleFormTriggerData>=async({
  data,
  nodeId,
  context,
  step,
  publish,
})=>{
//todo publish loading state for m
await publish(googleFormTriggerChannel().status({
  nodeId,
  status:"loading",
}));
  const result=await step.run("google-form-trigger",async ()=>context);

  //todo publish succes
  await publish(googleFormTriggerChannel ().status({
  nodeId,
  status:"success",
}));
return result;
  
}