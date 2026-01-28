import type { NodeExecutor } from "@/features/executions/components/types";
import { NonRetriableError } from "inngest";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { prisma } from "@/lib/db";

import { openaiChannel } from "@/inngest/channels/openai";

// Handlebars helper
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type OpenAIData = {
  variableName?: string;
  credentialId?: string;
  systemPrompts?: string;
  userPrompts?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // Publish loading state
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  // Validation
  if (!data.variableName) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("OpenAI node: Credential Id is required");
  }

  if (!data.userPrompts) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("OpenAI node: User prompt is missing");
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
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError("OpenAI node: Credential not found");
  }

  // Create OpenAI client
  const openai = createOpenAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai("gpt-4o-mini"),
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
      openaiChannel().status({
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
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
