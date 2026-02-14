import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getRecentOrders, type RecentOrder } from "@/services/dashboardService";

const statusStyles = {
  completed: "status-active",
  pending: "status-pending",
  cancelled: "status-blocked",
};

export function RecentOrders() {
  // Fetch recent orders
  const { data: orders = [] } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => getRecentOrders(5)
  });

  return (
    <div className="admin-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <p className="text-sm text-muted-foreground">Latest customer orders</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Product
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="text-sm font-medium text-primary">{order.id}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-foreground">{order.customer}</span>
                </td>
                <td className="py-3 px-2 hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">{order.product}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-medium text-foreground">
                    ₹{order.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <Badge
                    variant="outline"
                    className={cn("capitalize text-xs", statusStyles[order.status])}
                  >
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
        View All Orders
      </button>
    </div>
  );
}
