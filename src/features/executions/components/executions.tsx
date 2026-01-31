"use client";

import { formatDistanceToNow } from "date-fns";
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

import { useSuspenseExecutions,
} from "../hooks/use-executions";

import { useExecutionsParams } from "../hooks/use-executions-params";
import { useEntitySearch } from "@/hooks/use-entitySearch";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

import { Execution, ExecutionStatus } from "@/generated/prisma";
import Image from "next/image";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* 🔑 Client-safe inferred type (NO Prisma, NO new files)              */
/* ------------------------------------------------------------------ */

type ExecutionItem = ReturnType<
  typeof useSuspenseExecutions
>[0]["items"][number];


/* ----------------------------- List ----------------------------- */

export const ExecutionsList = () => {
  const [data] = useSuspenseExecutions();

  return (
    <EntityList
      items={data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <ExecutionItemRow data={item} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

/* ----------------------------- Header ----------------------------- */

export const ExecutionsHeader = () => {
  

  return (
  
      <EntityHeader
        title="Executions"
        description="Create and manage your executions"
        
        
      
      />
  
  );
};

/* ----------------------------- Pagination ----------------------------- */

export const ExecutionsPagination = () => {
  const [data, query] = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

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

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
    
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

/* ----------------------------- States ----------------------------- */

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading Executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading Executions" />;
};

export const ExecutionsEmpty = () => {
 
  return (
    <>
      
      <EmptyView
        
        message="No Executions found. Get started by creating your first workflow."
      />
    </>
  );
};

/* ----------------------------- Item ----------------------------- */

const getStatusIcon=(status:ExecutionStatus)=>{
  switch(status){
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
      default:
      return <ClockIcon className="size-5 text-muted-foreground" />;

  }
}
const formatStatus=(status:ExecutionStatus)=>{
  return status.charAt(0)+status.slice(1).toLowerCase();
}
export const ExecutionItemRow = ({ data,}: { data: ExecutionItem &{
  workflow:{
    id:string;
    name:string;

  };
} }) => {
 
const duration = data.completeAt?Math.round((new Date(data.completeAt).getTime()-new Date(data.startedAt).getTime())/1000):null;
const subtitle=(
  <>
  {data.workflow.name }&bull; Started{" "}
  {
    formatDistanceToNow(data.startedAt,{addSuffix:true})
  }
  {
    duration!==null&&<>&bull:Took {duration}s</>
  }
  </>
)
  return (
    <EntityItems
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
      
    />
  );
};
