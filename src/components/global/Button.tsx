import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type ButtonVariant = "button" | "link" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children?: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  buttonText?: string;
}

interface ButtonProps extends BaseProps {
  variant?: "button" | "secondary" | "outline" | "danger";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface LinkProps extends BaseProps {
  variant: "link";
  to: string;
  onClick?: () => void;
  buttonText?: string;
}

type CustomButtonProps = ButtonProps | LinkProps;

const MotionLink = motion(Link);

const CustomButton = (props: CustomButtonProps) => {
  const { children, className = "", variant = "button", size = "md", buttonText } = props;

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-base gap-2.5",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    button: "bg-blue-600 text-white hover:bg-blue-700 shadow-xs border border-transparent",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 shadow-xs",
    outline: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-xs",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-transparent",
    link: "bg-transparent text-sm font-semibold text-blue-600 hover:text-blue-700 p-0 shadow-none border-transparent",
  };

  const baseStyles = cn(
    "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all duration-150 cursor-pointer select-none no-underline whitespace-nowrap touch-manipulation",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]",
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (variant === "link") {
    const linkProps = props as LinkProps;
    return (
      <MotionLink
        to={linkProps.to}
        className={baseStyles}
        onClick={linkProps.onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {children ? children : buttonText}
      </MotionLink>
    );
  }

  const buttonProps = props as ButtonProps;

  return (
    <motion.button
      className={baseStyles}
      onClick={buttonProps.onClick}
      type={buttonProps.type || "button"}
      disabled={buttonProps.disabled}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children ? children : buttonText}
    </motion.button>
  );
};

export default CustomButton;
