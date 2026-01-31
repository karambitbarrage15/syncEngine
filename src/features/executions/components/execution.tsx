"use client";

import { ExecutionStatus } from "@/generated/prisma";
import {
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
  ClockIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useSuspenseExecution } from "../hooks/use-executions";

/* =============================
   View Model (prevents TS recursion)
============================= */
type ExecutionViewModel = {
  id: string;
  status: ExecutionStatus;
  startedAt: string;
  completeAt: string | null;
  inngestEventId: string | null;
  error: string | null;
  errorStack: string | null;
  workflowId: string;
  workflow: {
    id: string;
    name: string;
  };
  output:unknown|null;
};

/* =============================
   Helpers
============================= */
const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) =>
  status.charAt(0) + status.slice(1).toLowerCase();

/* =============================
   Component
============================= */
export const ExecutionView = ({
  executionId,
}: {
  executionId: string;
}) => {
  // ✅ FIX 1: hook returns a TUPLE, not { data }
   const [execution] =
    useSuspenseExecution(executionId) as unknown as [
      ExecutionViewModel
    ];

  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration =
    execution.completeAt
      ? Math.round(
          (new Date(execution.completeAt).getTime() -
            new Date(execution.startedAt).getTime()) /
            1000
        )
      : null;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <CardTitle>{formatStatus(execution.status)}</CardTitle>
          <CardDescription>
            Execution for {execution.workflow.name}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* META INFO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              href={`/workflows/${execution.workflowId}`}
              className="text-sm text-primary hover:underline"
            >
              {execution.workflow.name}
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Status
            </p>
            <p className="text-sm">{formatStatus(execution.status)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Started
            </p>
            <p className="text-sm">
              {formatDistanceToNow(new Date(execution.startedAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {execution.completeAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(
                  new Date(execution.completeAt),
                  { addSuffix: true }
                )}
              </p>
            </div>
          )}

          {duration !== null && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          )}

          {execution.inngestEventId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Event ID
              </p>
              <p className="text-sm break-all">
                {execution.inngestEventId}
              </p>
            </div>
          )}
        </div>

        {/* ERROR SECTION */}
        {execution.error && (
          <div className="mt-6 rounded-md bg-red-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">
                Error
              </p>
              <p className="text-sm text-red-800 font-mono">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {showStackTrace
                      ? "Hide stack trace"
                      : "Show stack trace"}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <pre className="mt-2 rounded bg-red-100 p-2 text-xs font-mono text-red-800 overflow-auto whitespace-pre-wrap">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

        )}{execution.output !== null && (
  <div className="mt-6 p-4 bg-muted rounded-md">
    <p className="text-sm font-medium mb-2">Output</p>
    <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap">
      {typeof execution.output === "string"
        ? execution.output
        : JSON.stringify(execution.output, null, 2)}
    </pre>
  </div>
)}


      </CardContent>
    </Card>
  );
};
