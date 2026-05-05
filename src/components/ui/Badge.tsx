import { ReactNode } from "react";

type BadgeVariant =
  | "active"
  | "inactive"
  | "pending"
  | "success"
  | "danger"
  | "warning"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-700",
  warning: "bg-orange-100 text-orange-700",
  default: "bg-blue-100 text-blue-700",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
