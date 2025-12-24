"use client";
import {formatDistanceToNow} from "date-fns";
import React from "react";
import { useRouter } from "next/navigation";

import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItems,
} from "@/components/entity-views";

import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";

import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entitySearch";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import type { Workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
/* ----------------------------- Search ----------------------------- */

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();

  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue ?? ""}
      onChange={(value) => onSearchChange(value ?? "")}
      placeholder="Search workflows"
    />
  );
};

/* ----------------------------- List ----------------------------- */

export const WorkflowsList = () => {
  const [data] = useSuspenseWorkflows();
return(
  <EntityList 
  items={data.items}
  getKey={(data)=>data.id}
  renderItem={(item)=><WorkflowItems data={item} />}
  emptyView={<WorkflowsEmpty />}

/>
)
 
};

/* ----------------------------- Header ----------------------------- */

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (workflow) => {
        router.push(`/workflows/${workflow.id}`);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

/* ----------------------------- Pagination ----------------------------- */

export const WorkflowsPagination = () => {
  const [data, query] = useSuspenseWorkflows();
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

/* ----------------------------- Container ----------------------------- */

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

/* ----------------------------- States ----------------------------- */

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows" />;
};

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="No workflows found. Get started by creating your first workflow."
      />
    </>
  );
};

export const WorkflowItems=({data}:{data:Workflow})=>{
  const removeWorkflow=useRemoveWorkflow();
  const handleRemove=()=>{
    removeWorkflow.mutate({id:data.id});
  }
  
return(
  <EntityItems 
  href={`/workflows/${data.id}`}
  title={data.name}
  subtitle={
    <>
    Updated {formatDistanceToNow(data.updatedAt,{addSuffix:true})}{" "}
    &bull;Created{" "}{formatDistanceToNow(data.createdAt,{addSuffix:true})}
   
    </>
  }  
  image={
    <div className="size-8 flex items-center justify-center">
      <WorkflowIcon className="size-5 text-muted-foreground"/>
    </div>
  }
  onRemove={handleRemove}
  isRemoving={removeWorkflow.isPending}
  />
)
}