import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className ?? ""}`.trim()} {...props} />;
}