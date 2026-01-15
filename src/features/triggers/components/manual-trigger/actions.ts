"use server";
import { getSubscriptionToken ,type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
export type ManualTriggerToken=Realtime.Token<typeof manualTriggerChannel,["status"]>;
export async function fetchManulaTriggerRealtimeToken():Promise<ManualTriggerToken>{
  const token=await getSubscriptionToken(inngest,{
    channel:httpRequestChannel(),
    topics:["status"],
  });
  return token;
}