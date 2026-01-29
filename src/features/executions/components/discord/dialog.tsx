"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and only contain letters, numbers, and underscores",
    }),
    username:z.string().optional(),
    content:z.string().min(1,"Message content is requuired").max(2000,"Discord messages can't exceed 2000 characters"),
    webhookUrl:z.string().min(1, "Webhook URL is required")
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DiscordFormValues) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const {data:credentials,
    isLoading:isLoadingCredentials,
  }=useCredentialsByType(CredentialType.GEMINI);
  const form = useForm<DiscordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
    username:defaultValues.username||"",
    content:defaultValues.content||"",
    webhookUrl:defaultValues.webhookUrl||"",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
    username:defaultValues.username||"",
    content:defaultValues.content||"",
    webhookUrl:defaultValues.webhookUrl||"",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myDiscord";

  const handleSubmit = (values: DiscordFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <Input placeholder="myDiscord" {...field} />
                  <FormDescription>
                    Use this name to reference the result:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

              {/* webhook */}
                        <FormField
                          control={form.control}
                          name="webhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook Url</FormLabel>
                             <FormControl>
                              <Input placeholder="https://discord.com.api/webhooks/..."{...field}/>
                             </FormControl>
                             <FormDescription>
                              Get this from Discord:Channel Setting--:Integration--:wWbhooks
                             </FormDescription>
                              <FormMessage />
            
            
            
            
            
                            </FormItem>
                          )}
                        />

            {/* Content */}
<FormField
  control={form.control}
  name="content"
  render={({ field }) => (
    <FormItem>
      <FormLabel> Content</FormLabel>
      <Textarea
        placeholder="Summary:{{myGemini.text}}"
        className="min-h-[100px] font-mono text-sm"
        {...field}
      />
      <FormDescription>
       Sets the behaviour of the assistant.Use {"{{variables}}"} for simple values of {"{{json variable}}"} to stringify objects
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bot Username (Optional)</FormLabel>
      <FormControl>
        <Input
          placeholder="Workflow Bot"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Override the webhook's default username
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

            <DialogFooter>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};