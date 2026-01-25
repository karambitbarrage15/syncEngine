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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: Props) => {
  // ✅ MATCH ROUTE NAME
  const params = useParams<{ workflows?: string }>();
  const workflowId = params.workflows;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  /* 🚫 Workflow not ready */
  if (!workflowId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stripe Trigger</DialogTitle>
            <DialogDescription>
              Save and open a workflow before configuring the Stripe trigger.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            This trigger requires a saved workflow with a valid workflow ID.
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

  /* ✅ Webhook URL */
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy webhook URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this workflow.
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

          {/* Setup Instructions */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers → Webhooks</li>
              <li>Click “Add endpoint”</li>
              <li>Paste the webhook URL above</li>
              <li>
                Select events to listen for (e.g.
                <code className="ml-1 bg-background px-1 py-0.5 rounded">
                  payment_intent.succeeded
                </code>
                )
              </li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          {/* Available Variables */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.amount}}"}
                </code>{" "}
                – Payment amount
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.currency}}"}
                </code>{" "}
                – Currency code
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.customerId}}"}
                </code>{" "}
                – Customer ID
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.eventType}}"}
                </code>{" "}
                – Event type
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{json.stripe}}"}
                </code>{" "}
                – Full Stripe event JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
