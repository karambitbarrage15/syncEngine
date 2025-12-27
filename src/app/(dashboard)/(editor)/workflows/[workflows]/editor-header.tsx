"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  useSuspenseWorkflows,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";

/* ========================= Save Button ========================= */

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="ml-auto">
      <Button size="sm" disabled>
        <SaveIcon className="size-4 mr-1" />
        Save
      </Button>
    </div>
  );
};

/* ========================= Name Input ========================= */

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  // ✅ CORRECT: tuple destructuring
  const [data] = useSuspenseWorkflows();
  const updateWorkflow = useUpdateWorkflowName();

  // ✅ Type is inferred correctly now
  const workflow = data.items.find(
    (item) => item.id === workflowId
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow?.name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  /* keep local name in sync */
  useEffect(() => {
    if (workflow?.name) {
      setName(workflow.name);
    }
  }, [workflow?.name]);

  /* autofocus input */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!workflow) return;

    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }
setIsEditing(false);
    try {
      await updateWorkflow.mutateAsync({
        id: workflow.id,
        name,
      });
    } catch {
      setName(workflow.name);
    } finally{
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setName(workflow?.name ?? "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
      disabled={updateWorkflow.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}

        className="h-7 w-auto min-w-[100px] px-2"
      />
    );
  }

  return (
    <BreadcrumbItem onClick={()=>setIsEditing(true)}
      className="font-medium text-foreground cursor-pointer"
      
    >
      {workflow?.name ?? "Workflow"}
    </BreadcrumbItem>
  );
};

/* ========================= Breadcrumbs ========================= */

export const EditorBreadCrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="cursor-pointer hover:text-foreground transition-colors">
          <BreadcrumbLink asChild>
            <Link href="/workflows">Workflows</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

/* ========================= Header ========================= */

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />

      <div className="flex w-full items-center justify-between gap-x-4">
        <EditorBreadCrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
};
