import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { NodeStatus } from "./node-status-indicator";
import {
  CheckCircle2Icon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* BaseNode                                                            */
/* ------------------------------------------------------------------ */

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: NodeStatus;
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, status, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        tabIndex={0}
        className={cn(
          "relative rounded-sm border border-muted-foreground bg-card text-card-foreground hover:bg-accent",
          "[.react-flow\\_\\_node.selected_&]:border-muted-foreground",
          "[.react-flow\\_\\_node.selected_&]:shadow-lg",
          className,
        )}
        {...props}
      >
        {children}

        {status === "error" && (
          <XCircleIcon className="absolute right-0.5 bottom-0.5 size-2 text-red-700 stroke-3" />
        )}

        {status === "success" && (
          <CheckCircle2Icon className="absolute right-0.5 bottom-0.5 size-2 text-green-700 stroke-3" />
        )}

        {status === "loading" && (
          <Loader2Icon className="absolute -right-0.5 -bottom-0.5 size-2 text-blue-700 stroke-3 animate-spin" />
        )}
      </div>
    );
  }
);

BaseNode.displayName = "BaseNode";



/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export function BaseNodeHeader({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <header
      {...props}
      className={cn(
        "mx-0 my-0 -mb-1 flex items-center justify-between gap-2 px-3 py-2",
        className,
      )}
    />
  );
}



/* ------------------------------------------------------------------ */
/* Header Title                                                        */
/* ------------------------------------------------------------------ */

export function BaseNodeHeaderTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn("select-none flex-1 font-semibold", className)}
      {...props}
    />
  );
}



/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export function BaseNodeContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="base-node-content"
      className={cn("flex flex-col gap-y-2 p-3", className)}
      {...props}
    />
  );
}



/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function BaseNodeFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn(
        "flex flex-col items-center gap-y-2 border-t px-3 pt-2 pb-3",
        className,
      )}
      {...props}
    />
  );
}
