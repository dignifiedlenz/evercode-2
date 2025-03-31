"use client";

import { useLoadingBar } from "../_hooks/useLoadingBar";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, variant = "default", size = "md", onClick, ...props }, ref) => {
    const { startLoading } = useLoadingBar();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      startLoading();
      onClick?.(e);
    };

    const baseStyles = "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      default: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
      secondary: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary",
      outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton; 