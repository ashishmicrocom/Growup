import { ShoppingCart, UserPlus, CreditCard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getRecentActivity, type RecentActivity as Activity } from "@/services/dashboardService";

const iconMap = {
  order: ShoppingCart,
  user: UserPlus,
  payout: CreditCard,
  product: Package,
};

const colorMap = {
  order: "bg-primary/10 text-primary",
  user: "bg-success/10 text-success",
  payout: "bg-accent/20 text-accent-foreground",
  product: "bg-info/10 text-info",
};

export function RecentActivity() {
  // Fetch recent activity
  const { data: activities = [] } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => getRecentActivity(5)
  });

  return (
    <div className="admin-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates across the platform</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn("rounded-lg p-2", colorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
        View All Activity
      </button>
    </div>
  );
}
