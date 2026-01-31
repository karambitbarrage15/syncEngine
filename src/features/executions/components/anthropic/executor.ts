import type { NodeExecutor } from "@/features/executions/components/types";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { prisma } from "@/lib/db";

import { anthropicChannel } from "@/inngest/channels/anthropic";
import { decrypt } from "@/lib/encryption";

// Handlebars helper
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  systemPrompts?: string;
  userPrompts?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  // Publish loading state
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );

  // Validation
  if (!data.variableName) {
    await publish(
      anthropicChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Anthropic node: Variable name is missing"
    );
  }

  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Anthropic node: Credential Id is required"
    );
  }

  if (!data.userPrompts) {
    await publish(
      anthropicChannel().status({ nodeId, status: "error" })
    );
    throw new NonRetriableError(
      "Anthropic node: User prompt is missing"
    );
  }

  // Compile prompts
  const systemPrompts = data.systemPrompts
    ? Handlebars.compile(data.systemPrompts)(context)
    : "You are a helpful assistant.";

  const userPrompts = Handlebars.compile(data.userPrompts)(context);

  // Fetch credential from DB
  const credential = await step.run("get-credential", () => {
    return prisma.credentials.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError(
      "Anthropic node: Credential not found"
    );
  }

  // Create Anthropic client
  const anthropic = createAnthropic({
    apiKey: decrypt(credential.value),
  });

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
