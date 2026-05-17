import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "cursor-pointer",
    "rounded-button-radius text-sm font-medium",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-button-primary-bg-default text-button-primary-text-default hover:bg-button-primary-bg-hover shadow-sm",
        primary:
          "bg-button-primary-bg-default text-button-primary-text-default hover:bg-button-primary-bg-hover shadow-sm",
        secondary:
          "border border-border-default bg-bg-surface text-text-primary hover:bg-bg-subtle",
        destructive:
          "bg-feedback-error-icon text-text-on-error hover:opacity-90 shadow-sm",
        outline:
          "border border-border-default bg-transparent text-text-primary hover:bg-bg-subtle",
        subtle:
          "bg-bg-subtle text-text-primary hover:bg-bg-surface",
        ghost:
          "bg-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
        link:
          "h-auto rounded-none px-0 py-0 text-text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        md: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isIconOnly = size === "icon";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {!isIconOnly && children ? <span>{children}</span> : children}

        {!loading && rightIcon ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };