import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Select = React.forwardRef(
  ({ className, children, value, onChange, disabled, id, placeholder }, ref) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef(null);

    const options = React.Children.toArray(children)
      .filter((child) => React.isValidElement(child))
      .map((child) => ({ value: child.props.value, label: child.props.children }));

    React.useEffect(() => {
      if (!open) return;
      function handleClickOutside(e) {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const selected = options.find((o) => o.value === value);

    function handleSelect(optValue) {
      setOpen(false);
      onChange?.({ target: { value: optValue } });
    }

    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          ref={ref}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder ?? "Selecione..."}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        {open && !disabled && (
          <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
            <ul className="max-h-60 overflow-y-auto py-1">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      opt.value === value ? "bg-primary/15 font-medium text-primary" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
