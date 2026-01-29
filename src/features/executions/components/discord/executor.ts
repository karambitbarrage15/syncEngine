import type { NodeExecutor } from "@/features/executions/components/types";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import ky from "ky";
import { discordChannel } from "@/inngest/channels/discord";

/* ---------------- Handlebars helper ---------------- */

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

/* ---------------- Types ---------------- */

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

/* ---------------- Executor ---------------- */

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  publish,
  step,
}) => {
  /* ---------- loading ---------- */
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    })
  );

  /* ---------- validation ---------- */
  if (!data.variableName) {
    await publish(discordChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Discord node: Variable name is missing");
  }

  if (!data.webhookUrl) {
    await publish(discordChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Discord node: Webhook URL is missing");
  }

  if (!data.content) {
    await publish(discordChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Discord node: Message content is missing");
  }

  /* ---------- render content ---------- */
  const renderedContent = decode(
    Handlebars.compile(data.content)(context)
  );

  const renderedUsername = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  /* ---------- send webhook ---------- */
  try {
    await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: renderedContent.slice(0, 2000),
          ...(renderedUsername ? { username: renderedUsername } : {}),
        },
      });
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );

    /* ---------- return context ---------- */
    return {
      ...context,
      [data.variableName]: {
        discordMessageSent: true,
      },
    };
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
