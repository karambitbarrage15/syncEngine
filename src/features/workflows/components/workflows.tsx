'use client';

import { EntityHeader, EntityContainer, EntitySearch, EntityPagination } from "@/components/entity-views";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import React from "react";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entitySearch";
export const WorkflowsSearch=()=>{
 const [params,setParams]=useWorkflowsParams();
 const {searchValue,onSearchChange}=useEntitySearch({
  params,
  setParams,

 });
  return (
  <EntitySearch
  value={searchValue ?? ""}
  onChange={(value) => onSearchChange(value ?? "")}
  placeholder="Search workflows"
/>

  )
}
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
export const WorkflowsPagination = () => {
  const [data, query] = useSuspenseWorkflows(); // ✅ TUPLE
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={query.isFetching}
      totalPages={data.totalPages}
      page={data.page}
      onPageChange={(page) => {
        setParams({ ...params, page });
      }}
    />
  );
};
/*
export const WorkflowsPagination=()=>{
   const workflows = useSuspenseWorkflows();
  const [params,setParams]=useWorkflowsParams();
  return (
    <EntityPagination
    disabled={workflows.isFetching}
    totalPages={workflows.data.totalPages} 
    page={workflows.data.page}
    onPageChange={(page)=>{
      setParams({...params,page})
    }}/>
  )
}
*/
export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch/>}
      pagination={<WorkflowsPagination/>}
    >
      {children}
    </EntityContainer>
  );
};
