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
 credentialId:z.string().min(1,"Credential is required"),
  systemPrompts: z.string().optional(),
  userPrompts: z.string().min(1, "User prompts are required"),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GeminiFormValues) => void;
  defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const {data:credentials,
    isLoading:isLoadingCredentials,
  }=useCredentialsByType(CredentialType.GEMINI);
  const form = useForm<GeminiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
     credentialId:defaultValues.credentialId||"",
      systemPrompts: defaultValues.systemPrompts ?? "",
      userPrompts: defaultValues.userPrompts ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
            credentialId:defaultValues.credentialId||"",
        systemPrompts: defaultValues.systemPrompts ?? "",
        userPrompts: defaultValues.userPrompts ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myGemini";

  const handleSubmit = (values: GeminiFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>
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
                  <Input placeholder="myGemini" {...field} />
                  <FormDescription>
                    Use this name to reference the result:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

              {/* Type */}
                        <FormField
                          control={form.control}
                          name="credentialId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gemini Credential</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isLoadingCredentials||!credentials?.length}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a credential" />
                                  </SelectTrigger>
                                </FormControl>
            
                                <SelectContent>
                                  {credentials?.map((credential) => (
                                    <SelectItem
                                      key={credential.id}
                                      value={credential.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Image
                                          src="/logos/gemini.svg"
                                          alt="Gemini"
                                          width={16}
                                          height={16}
                                        />
                                        {credential.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
            
            
            
            
            
                            </FormItem>
                          )}
                        />

            {/* System Prompts */}
<FormField
  control={form.control}
  name="systemPrompts"
  render={({ field }) => (
    <FormItem>
      <FormLabel>System Prompts</FormLabel>
      <Textarea
        placeholder={`You are a helpful AI assistant. Follow the instructions carefully.`}
        className="min-h-[100px] font-mono text-sm"
        {...field}
      />
      <FormDescription>
        Defines the behavior and rules for the AI (optional).
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
            {/* User Prompts */}
            <FormField
              control={form.control}
              name="userPrompts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompts</FormLabel>
                  <Textarea
                    placeholder={`Summarize this text: {{json httpResponse.data}}`}
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                  />
                  <FormDescription>
                    Use {"{{variables}}"} for values and {"{{json variable}}"} to
                    stringify objects.
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
