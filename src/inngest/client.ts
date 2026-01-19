import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

export const inngest = new Inngest({
  id: "SyncEngine", // must match Inngest dashboard app id
  eventKey: process.env.INNGEST_EVENT_KEY, // REQUIRED
  middleware: [realtimeMiddleware()],
});
