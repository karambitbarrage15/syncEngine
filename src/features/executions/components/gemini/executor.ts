import type { NodeExecutor } from "@/features/executions/components/types";
import { NonRetriableError } from "inngest";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import Handlebars from "handlebars";

import { geminiChannel } from "@/inngest/channels/gemini";

import {generateText} from "ai";
Handlebars.registerHelper("json",(context)=>{
  const stringified=JSON.stringify(context,null,2);
  const safeString=new Handlebars.SafeString(stringified);
  return safeString;
});
type GeminiData = {
  variableName?:string;

  systemPrompts?:string;
  userPrompts?:string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // TODO: publish loading state for manual trigger
  await publish(geminiChannel().status({
    nodeId,
    status:"loading",
  }));

  if(!data.variableName){
    await publish(
      geminiChannel().status({
        nodeId,
        status:"error"
      })
    );
    throw new NonRetriableError("Gemini node:Variable name is missing")
  }

  if(!data.userPrompts){
     await publish(
      geminiChannel().status({
        nodeId,
        status:"error"
      })
    );
    throw new NonRetriableError("Gemini node:User Prompt is missing");

  }

  //todo throw if credentail  is missing
const systemPrompts=data.systemPrompts?Handlebars.compile(data.systemPrompts)(context):"You are a helpful assistant.";
const userPrompts=Handlebars.compile(data.userPrompts)(context);
//todo fetch crendentails
const crendentailValue=process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const google=createGoogleGenerativeAI({
  apiKey:crendentailValue,

});
try{
  const {steps}=await step.ai.wrap("gemini-generate-text",generateText,{
    model:google("gemini-2.0-flash"),
    system:systemPrompts,
    prompt:userPrompts,

    experimental_telemetry
:{
      isEnabled:true,
      recordInputs:true,
      recordOutputs:true,
    }
  });

 const text =
  steps[0]?.content?.[0]?.type === "text"
    ? steps[0].content[0].text
    : "";

  await publish(geminiChannel().status({nodeId,
    status:"success",

  }));
  return{
    ...context,
    [data.variableName]:{
      text,
    }
  }

}catch(error){
  await publish(
    geminiChannel().status({
      nodeId,
      status:"error",
    })
  );
  throw error;


}

};