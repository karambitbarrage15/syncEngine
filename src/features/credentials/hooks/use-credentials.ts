"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma";

/* ------------------------------------------------------------------ */
/* Create Credential                                                   */
/* ------------------------------------------------------------------ */

export const useCreateCredential = () => {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.credentails.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Credential "${data.name}" created`);

      router.push("/credentials");

      utils.credentails.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create Credential: ${error.message}`);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Fetch Credentials (Suspense)                                        */
/* ------------------------------------------------------------------ */

export const useSuspenseCredentials = () => {
  const [params] = useCredentialsParams();

  return trpc.credentails.getMany.useSuspenseQuery(params);
};

/* ------------------------------------------------------------------ */
/* Fetch SINGLE Credential                                             */
/* ------------------------------------------------------------------ */

export const useSuspenseCredential = (id: string) => {
  return trpc.credentails.getOne.useSuspenseQuery({ id });
};

/* ------------------------------------------------------------------ */
/* Remove Credential                                                   */
/* ------------------------------------------------------------------ */

export const useRemoveCredential = () => {
  const utils = trpc.useUtils();

  return trpc.credentails.remove.useMutation({
    onSuccess: (data) => {
      toast.success(`Credential "${data.name}" removed`);

      utils.credentails.getMany.invalidate();
      utils.credentails.getOne.invalidate({ id: data.id });
    },
    onError: (error) => {
      toast.error(`Failed to remove Credential: ${error.message}`);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Update Credential                                                   */
/* ------------------------------------------------------------------ */

export const useUpdateCredential = () => {
  const utils = trpc.useUtils();

  return trpc.credentails.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Credential "${data.name}" updated`);

      utils.credentails.getMany.invalidate();
      utils.credentails.getOne.invalidate({ id: data.id });
    },
    onError: (error) => {
      toast.error(`Failed to update Credential: ${error.message}`);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Fetch Credentials By Type                                           */
/* ------------------------------------------------------------------ */

export const useCredentialsByType = (type: CredentialType) => {
  return trpc.credentails.getByType.useQuery({ type });
};
