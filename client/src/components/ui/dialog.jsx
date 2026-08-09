import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Dialog({ ...props }) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50",
          "-translate-x-1/2 -translate-y-1/2",

          "flex flex-col",

          "w-[calc(100%-32px)]",
          "max-w-7xl",

          "h-[92vh]",
          "max-h-[92vh]",

          "overflow-hidden",

          "rounded-2xl",
          "border border-border",

          "bg-background",
          "text-foreground",

          "shadow-[0_25px_80px_rgba(15,23,42,0.25)]",

          "outline-none",

          "data-open:animate-in",
          "data-open:fade-in-0",
          "data-open:zoom-in-95",

          "data-closed:animate-out",
          "data-closed:fade-out-0",
          "data-closed:zoom-out-95",

          className,
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="
                  absolute
                  right-5
                  top-5
                  z-50

                  h-9
                  w-9

                  rounded-full

                  border
                  border-border

                  bg-background

                  text-muted-foreground

                  shadow-sm

                  hover:bg-accent
                  hover:text-accent-foreground
                "
              />
            }
          >
            <XIcon className="h-4 w-4" />

            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "shrink-0",
        "border-b border-border",
        "bg-background",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "shrink-0",

        "border-t border-border",

        "bg-background",

        "px-6 py-4",

        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
