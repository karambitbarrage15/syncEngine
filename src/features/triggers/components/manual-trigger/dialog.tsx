"use client";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";
interface Props{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
};
export const ManualTriggerDialog=({open,onOpenChange,}:Props)=>{
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Trigger</DialogTitle>
            <DialogDescription>
              Configure settings for the manual trigger node.
            </DialogDescription>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
               Use to Manually  execute a Workflow ,no configration available
              </p>
            </div>
          </DialogHeader>
        </DialogContent>

    </Dialog>
  )

};