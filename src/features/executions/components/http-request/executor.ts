import type { NodeExecutor } from "@/features/executions/components/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";
Handlebars.registerHelper("json",(context)=>{
  const stringified=JSON.stringify(context,null,2);
  const safeString=new Handlebars.SafeString(stringified);
  return safeString;
});
type HttpRequestData = {
  variableName:string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // TODO: publish loading state for manual trigger
  await publish(httpRequestChannel().status({
    nodeId,
    status:"loading",
  }))
  if (!data.endpoint) {
    await publish(httpRequestChannel().status({
    nodeId,
    status:"error",
  }))
    throw new NonRetriableError(
      "Http Request node: No endpoint configured"
    );
  }
 if (!data.variableName) {await publish(httpRequestChannel().status({
    nodeId,
    status:"error",
  }))
    throw new NonRetriableError(
      "No Variable name configured"
    );
  }if (!data.method)  {await publish(httpRequestChannel().status({
    nodeId,
    status:"error",
  }))
    throw new NonRetriableError(
      " No method configured"
    );
  }
  try{
  const result = await step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endpoint)(context);
    console.log("ENDPOINT",{endpoint})
    const method = data.method;

    const options: KyOptions = {
      method,
    };

    // Only attach body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved=Handlebars.compile(data.body||"{}")(context);
      JSON.parse(resolved);
      if (data.body) {
        options.body = resolved;
        options.headers={
          "Content-Type":"application/json",
        }
      }
    }

    const response = await ky(endpoint, options);

    const contentType = response.headers.get("content-type");

    const responseData =
      contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
const responsePayload={
  httpResponse:{
    status:response.status,
    statusText:response.statusText,
    data:responseData,
  },
};
const compiledVariableName=Handlebars.compile(data.variableName)(context);
   if(data.variableName){ return {
      ...context,
    [compiledVariableName]:responsePayload,
    };}
 
//FALLVBACK TO DIRECT HTTTPRESPONSE FOR BACKWARD COMPATIBILITY
return {
  ...context,
  ...responsePayload
}
 });
 await publish(httpRequestChannel().status({
    nodeId,
    status:"success",
  }))
  // TODO: publish success state
  return result;}
  catch(error){
    
await publish(httpRequestChannel().status({
    nodeId,
    status:"error",
  }))
  throw error;
} 
};
