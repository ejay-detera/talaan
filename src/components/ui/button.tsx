import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-row font-sans font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-ink text-sheet hover:bg-[#162F85] active:bg-[#122569]",
        secondary:
          "bg-sheet text-pencil border border-rule hover:bg-paper active:bg-[#E8EDE0]",
        outline:
          "border border-rule bg-transparent text-pencil hover:bg-paper active:bg-[#E8EDE0]",
        ghost: "text-pencil hover:bg-paper hover:text-ink",
        link: "text-ink underline-offset-4 hover:underline p-0 h-auto font-normal",
        paid: "bg-paid text-sheet hover:bg-[#18623D] active:bg-[#124B2E]",
      },
      size: {
        default: "min-h-[48px] px-5 py-2.5 text-sm",
        sm: "min-h-[36px] px-3.5 py-1.5 text-xs",
        lg: "min-h-[56px] px-8 py-3.5 text-base",
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
