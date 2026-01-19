"use server";
import { getSubscriptionToken ,type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";

import { googleFormTriggerChannel } from "@/inngest/channels/goggle-form-trigger copy";
export type GoogleFormToken=Realtime.Token<typeof googleFormTriggerChannel,["status"]>;
export async function fetchGoogleFormRealtimeToken():Promise<GoogleFormToken>{
  const token=await getSubscriptionToken(inngest,{
    channel:googleFormTriggerChannel(),
    topics:["status"],
  });
  return token;
}