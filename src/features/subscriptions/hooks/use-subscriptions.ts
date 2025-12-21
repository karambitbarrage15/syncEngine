import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { subscribe } from "diagnostics_channel";

export const useSubscription=()=>{
  return useQuery({
    queryKey:["subscription"],
    queryFn:async ()=>{
      const {data}=await authClient.customer.state();
      return data;
    }
  })
};
  export const useHasActiveSubscription=()=>{
const {data:customerState,isLoading,...rest}=useSubscription();
const hasActiveSubscripition=customerState?.activeSubscriptions&&customerState.activeSubscriptions.length>0;
return {hasActiveSubscripition,
 subscription:customerState?.activeSubscriptions?.[0],

  isLoading,
  ...rest,
}
  }
