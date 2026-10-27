import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-row px-2 py-0.5 text-xs font-sans font-semibold select-none",
  {
    variants: {
      variant: {
        default:
          "border border-rule bg-sheet text-pencil",
        secondary:
          "border border-rule bg-paper text-muted font-medium",
        outline:
          "border border-rule text-pencil",
        discrepancy:
          "border border-margin bg-[#FDF2F2] text-margin font-semibold",
        review:
          "border border-pencil/30 bg-marker text-pencil font-semibold",
        verified:
          "border border-paid/40 bg-[#F0FDF4] text-paid font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
