"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({
  open,
  onOpenChange,
}: Props) => {
  const params = useParams<{ workflowId?: string }>();
  const workflowId = params.workflowId;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 🚫 Workflow not ready
  if (!workflowId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Form Trigger</DialogTitle>
            <DialogDescription>
              Save and open a workflow before configuring the Google Form trigger.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            This trigger requires a saved workflow with a valid ID.
          </div>

          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // ✅ SAFE: workflowId exists
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy webhook URL");
    }
  };

  const copyScript = async () => {
    try {
      const script = generateGoogleFormScript(webhookUrl);
      await navigator.clipboard.writeText(script);
      toast.success("Google Apps Script copied");
    } catch {
      toast.error("Failed to copy script");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form Apps Script to trigger this workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                className="font-mono text-sm"
                value={webhookUrl}
                readOnly
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyWebhookUrl}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Open your Google Form</li>
              <li>Click the three dots → Script editor</li>
              <li>Paste the script below</li>
              <li>Save and add a trigger</li>
              <li>Choose “From form” → “On form submit”</li>
            </ol>
          </div>

          {/* Script */}
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm">Google Apps Script</h4>
            <Button
              type="button"
              variant="outline"
              onClick={copyScript}
            >
              <CopyIcon className="size-4 mr-2" />
              Copy Google Apps Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook URL and handles form submissions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
