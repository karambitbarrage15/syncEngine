import { requireAuth } from "@/lib/auth-utils";
import { CredentialForm } from "@/features/credentials/components/credential";

const Page=async ()=>{
  await requireAuth();
  return (
      <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex-col gap-8 h-full">
        <CredentialForm />
      </div>
    </div>
  );
}
export default Page;