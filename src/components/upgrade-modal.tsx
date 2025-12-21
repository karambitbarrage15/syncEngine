"use-client";
import{
AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,
AlertDialogOverlay,AlertDialogPortal,AlertDialogTitle,AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
interface UpgradeModalProps{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
};
export const UpgradeModal=({
  open,
  onOpenChange
}:UpgradeModalProps)=>{
  return (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
         <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
         <AlertDialogDescription>
          You need an active subscription to perform this action.Upgrade to Pro to unlock all feartures.
         </AlertDialogDescription>
         
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
         onClick={() => authClient.checkout({ slug: "syncEngine-Pro" })}>Upgrade Now</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  )
};