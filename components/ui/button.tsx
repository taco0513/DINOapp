import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-action-manipulation active:scale-[0.98] touch-target",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md ios-button-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground ios-button-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground ios-button-ghost",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        "destructive-outline": "border border-destructive/30 text-destructive hover:bg-destructive/10 shadow-sm",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md",
      },
      size: {
        default: "min-h-[44px] min-w-[44px] px-4 py-2 text-sm rounded-md",
        sm: "min-h-[44px] min-w-[44px] px-3 py-2 text-sm rounded-md",
        lg: "min-h-[48px] min-w-[48px] px-6 py-3 text-base rounded-lg",
        xl: "min-h-[52px] min-w-[52px] px-8 py-4 text-lg rounded-lg",
        icon: "min-h-[44px] min-w-[44px] p-2 rounded-md",
        "icon-sm": "min-h-[40px] min-w-[40px] p-2 rounded-md",
        "icon-lg": "min-h-[48px] min-w-[48px] p-3 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }