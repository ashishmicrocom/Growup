import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "accent" | "success" | "info";
}

const variantStyles = {
  default: "bg-card",
  primary: "stat-card-primary",
  accent: "stat-card-accent",
  success: "stat-card-success",
  info: "stat-card-info",
};

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isDefault = variant === "default";

  return (
    <div
      className={cn(
        "rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]",
        variantStyles[variant],
        isDefault && "admin-card"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              isDefault ? "text-muted-foreground" : "opacity-90"
            )}
          >
            {title}
          </p>
          <p className={cn("text-3xl font-bold", isDefault && "text-foreground")}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isDefault
                    ? isPositive
                      ? "text-success"
                      : "text-destructive"
                    : "opacity-90"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span
                className={cn(
                  "text-sm",
                  isDefault ? "text-muted-foreground" : "opacity-75"
                )}
              >
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-lg p-3",
            isDefault ? "bg-primary/10" : "bg-white/20"
          )}
        >
          <Icon className={cn("h-6 w-6", isDefault ? "text-primary" : "")} />
        </div>
      </div>
    </div>
  );
}
