'use client';

import { EntityHeader, EntityContainer } from "@/components/entity-views";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import React from "react";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

export const WorkflowsList = () => {
  const [workflows] = useSuspenseWorkflows(); // ✅ FIXED

  return (
    <div className="flex-1 flex justify-center items-center">
      <p>{JSON.stringify(workflows, null, 2)}</p>
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter(); // App Router
  const createWorkflow = useCreateWorkflow(router); // ✅ types now match
const {handleError,modal}=useUpgradeModal();
  const handleCreate = () => {
    createWorkflow.mutate(undefined,{
      onError:(error)=>{
        handleError(error);
      }
    });
  };

  return (<>
  {modal}
  <EntityHeader
      title="Workflows"
      description="Create and Manage your Workflows"
      onNew={handleCreate}
      newButtonLabel="New Workflow"
      disabled={disabled}
      isCreating={createWorkflow.isPending}
    /></>
    
  );
};

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
