import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import {
  Users,
  UserCheck,
  ShoppingCart,
  IndianRupee,
  Package,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboardService";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats
  });

  const stats = [
    {
      title: "Total Users",
      value: dashboardStats?.totalUsers.formatted || "0",
      change: dashboardStats?.totalUsers.change || 0,
      icon: Users,
      variant: "default" as const,
    },
    {
      title: "Total Resellers",
      value: dashboardStats?.totalResellers.formatted || "0",
      change: dashboardStats?.totalResellers.change || 0,
      icon: UserCheck,
      variant: "primary" as const,
    },
    {
      title: "Total Orders",
      value: dashboardStats?.totalOrders.formatted || "0",
      change: dashboardStats?.totalOrders.change || 0,
      icon: ShoppingCart,
      variant: "accent" as const,
    },
    {
      title: "Total Revenue",
      value: dashboardStats?.totalRevenue.formatted || "₹0",
      change: dashboardStats?.totalRevenue.change || 0,
      icon: IndianRupee,
      variant: "success" as const,
    },
    {
      title: "Today's Orders",
      value: dashboardStats?.todayOrders.formatted || "0",
      change: dashboardStats?.todayOrders.change || 0,
      icon: Package,
      variant: "info" as const,
    },
    {
      title: "Pending Orders",
      value: dashboardStats?.pendingOrders.formatted || "0",
      change: dashboardStats?.pendingOrders.change || 0,
      icon: Clock,
      variant: "default" as const,
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, Admin!">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Activity & Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentActivity />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2 mt-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      
    </AdminLayout>
  );
}
