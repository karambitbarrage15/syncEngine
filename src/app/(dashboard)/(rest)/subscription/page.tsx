"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Page = () => {
  const testAi = trpc.ai.testAi.useMutation({
    onSuccess: () => {
      toast.success("Success");
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  return (
    <Button onClick={() => testAi.mutate()}>
      Click to test Subscription
    </Button>
  );
};

export default Page;
 