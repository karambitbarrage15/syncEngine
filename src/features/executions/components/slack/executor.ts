import type { NodeExecutor } from "@/features/executions/components/types";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

/* ---------------- Handlebars helper ---------------- */

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

/* ---------------- Types ---------------- */

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

/* ---------------- Executor ---------------- */

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  publish,
  step,
}) => {
  /* ---------- loading ---------- */
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  );

  /* ---------- validation ---------- */
  if (!data.variableName) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Slack node: Variable name is missing");
  }

  if (!data.webhookUrl) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Slack node: Webhook URL is missing");
  }

  if (!data.content) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Slack node: Message content is missing");
  }

  /* ---------- render content ---------- */
  const renderedText = decode(
    Handlebars.compile(data.content)(context)
  );

  const renderedUsername = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  /* ---------- send webhook ---------- */
  try {
    await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: renderedText,
          ...(renderedUsername ? { username: renderedUsername } : {}),
        },
      });
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    /* ---------- return context ---------- */
    return {
      ...context,
      [data.variableName]: {
        slackMessageSent: true,
      },
    };
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
