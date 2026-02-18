import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variantMap = {
  default: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-error",
  success: "btn-success",
  link: "btn-link",
} as const;

const sizeMap = {
  default: "",
  sm: "btn-sm",
  lg: "btn-lg",
  icon: "btn-square btn-sm",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantMap;
  size?: keyof typeof sizeMap;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const classes = cn(
      "btn",
      variantMap[variant],
      sizeMap[size],
      className
    );

    if (asChild) {
      return <Slot className={classes} ref={ref} {...props} />;
    }

    return <button className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
