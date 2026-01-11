import type { NodeExecutor } from "@/features/executions/components/types";
type ManualTriggerData=Record<string,unknown>;
export const manualTriggerExecutor:NodeExecutor<ManualTriggerData>=async({
  data,
  nodeId,
  context,
  step,
})=>{
//todo publish loading state for manula trigger
  const result=await step.run("manual-trigger",async ()=>context);

  //todo publish succes
return result;
  
}