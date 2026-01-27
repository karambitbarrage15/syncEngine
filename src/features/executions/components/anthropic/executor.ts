import type { NodeExecutor } from "@/features/executions/components/types";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";
import Handlebars from "handlebars";
import { generateText } from "ai";

import { anthropicChannel } from "@/inngest/channels/anthropic";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type AnthropicData = {
  variableName?: string;
  systemPrompts?: string;
  userPrompts?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(anthropicChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.userPrompts) {
    await publish(anthropicChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  const systemPrompts = data.systemPrompts
    ? Handlebars.compile(data.systemPrompts)(context)
    : "You are a helpful assistant.";

  const userPrompts = Handlebars.compile(data.userPrompts)(context);

  const apiKey = process.env.ANTHROPIC_API_KEY!;
  if (!apiKey) {
    throw new NonRetriableError("Anthropic API key is missing");
  }

  const anthropic = createAnthropic({ apiKey });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-3-5-sonnet-20241022"),
        system: systemPrompts,
        prompt: userPrompts,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const text =
      steps[0]?.content?.[0]?.type === "text"
        ? steps[0].content[0].text
        : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
