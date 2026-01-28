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

import {
  
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";

import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entitySearch";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

import { CredentialType } from "@/generated/prisma";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/* 🔑 Client-safe inferred type (NO Prisma, NO new files)              */
/* ------------------------------------------------------------------ */

type CredentialItem = ReturnType<
  typeof useSuspenseCredentials
>[0]["items"][number];

/* ----------------------------- Search ----------------------------- */

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();

  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue ?? ""}
      onChange={(value) => onSearchChange(value ?? "")}
      placeholder="Search credentials"
    />
  );
};

/* ----------------------------- List ----------------------------- */

export const CredentialsList = () => {
  const [data] = useSuspenseCredentials();

  return (
    <EntityList
      items={data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <CredentialItemRow data={item} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

/* ----------------------------- Header ----------------------------- */

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  

  return (
  
      <EntityHeader
        title="Credentials"
        description="Create and manage your credentials"
        
        newButtonHref="/credentials/new"
        newButtonLabel="New Credentials"
        disabled={disabled}
      
      />
  
  );
};

/* ----------------------------- Pagination ----------------------------- */

export const CredentialsPagination = () => {
  const [data, query] = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

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

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

/* ----------------------------- States ----------------------------- */

export const CredentialsLoading = () => {
  return <LoadingView message="Loading Credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading Credentials" />;
};

export const CredentialsEmpty = () => {
  const router=useRouter();
  

  const handleCreate = () => {
    router.push(`/credentials/new`)
  };

  return (
    <>
      
      <EmptyView
        onNew={handleCreate}
        message="No Credentials found. Get started by creating your first credential."
      />
    </>
  );
};

/* ----------------------------- Item ----------------------------- */

const credentailLogos:Record<CredentialType,string>={
  [CredentialType.OPENAI]:"/logos/openai.svg",[CredentialType.ANTHROPIC]:"/logos/anthropic.svg",
  [CredentialType.GEMINI]:"/logos/gemini.svg",
}
export const CredentialItemRow = ({ data }: { data: CredentialItem }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };
const logo=credentailLogos[data.type]||"/logos/openai.svg";
  return (
    <EntityItems
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated{" "}
          {formatDistanceToNow(new Date(data.updatedAt), {
            addSuffix: true,
          })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(new Date(data.createdAt), {
            addSuffix: true,
          })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20}height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
