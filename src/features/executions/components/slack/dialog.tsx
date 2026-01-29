"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/* ---------------- Schema ---------------- */

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and only contain letters, numbers, and underscores",
    }),

  webhookUrl: z.string().min(1, "Webhook URL is required"),



  content: z.string().min(1, "Message content is required"),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SlackFormValues) => void;
  defaultValues?: Partial<SlackFormValues>;
}

/* ---------------- Component ---------------- */

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SlackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "mySlack",
      webhookUrl: defaultValues.webhookUrl ?? "",
     
      content: defaultValues.content ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "mySlack",
        webhookUrl: defaultValues.webhookUrl ?? "",
     
        content: defaultValues.content ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "mySlack";

  const handleSubmit = (values: SlackFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Send a message to a Slack channel using an incoming webhook.
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
                  <FormControl>
                    <Input placeholder="mySlack" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference this node later as{" "}
                    <code>{`{{${watchVariableName}}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Webhook URL */}
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://hooks.slack.com/services/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Slack → Apps → Incoming Webhooks → Copy Webhook URL
                  </FormDescription>
                  <FormDescription>
                    Make sure the "key" is "content"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Content */}
           <FormField
  control={form.control}
  name="content"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Message Text</FormLabel>
      <Textarea
        placeholder="Build finished successfully 🚀"
        className="min-h-[120px] font-mono text-sm"
        {...field}
      />
      <FormDescription>
        Supports <code>{"{{variables}}"}</code> and{" "}
        <code>{"{{json variable}}"}</code>.
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
