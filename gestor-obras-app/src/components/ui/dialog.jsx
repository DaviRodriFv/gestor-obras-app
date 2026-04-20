import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const DialogContext = React.createContext({});

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild }) {
  const { onOpenChange } = React.useContext(DialogContext);
  if (asChild) {
    return React.cloneElement(children, { onClick: () => onOpenChange(true) });
  }
  return <span onClick={() => onOpenChange(true)}>{children}</span>;
}

function DialogPortal({ children }) {
  const { open } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  );
}

function DialogOverlay({ className, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 grid w-full max-w-lg gap-4 bg-background p-6 shadow-lg sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
