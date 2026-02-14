import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { IndianRupee, TrendingUp, Clock, CheckCircle, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getEarningsStats,
  getEarningsTrend,
  getTopResellers,
  getAllPayouts,
  type Payout
} from "@/services/earningService";

export default function Earnings() {
  // Fetch earnings stats
  const { data: stats } = useQuery({
    queryKey: ['earningsStats'],
    queryFn: getEarningsStats
  });

  // Fetch earnings trend
  const { data: earningsData = [] } = useQuery({
    queryKey: ['earningsTrend'],
    queryFn: () => getEarningsTrend(6)
  });

  // Fetch top resellers
  const { data: topResellers = [] } = useQuery({
    queryKey: ['topResellers'],
    queryFn: () => getTopResellers(5)
  });

  // Fetch payout history
  const { data: payoutsResponse } = useQuery({
    queryKey: ['payouts'],
    queryFn: () => getAllPayouts({ page: 1, limit: 10 })
  });

  const payoutHistory = payoutsResponse?.data || [];

  const payoutColumns = [
  {
    key: "payoutId",
    label: "Payout ID",
    render: (item: Payout) => (
      <span className="font-medium text-primary">{item.payoutId}</span>
    ),
  },
  {
    key: "reseller",
    label: "Reseller",
    render: (item: Payout) => (
      <span className="text-foreground">{item.reseller}</span>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (item: Payout) => (
      <span className="font-medium text-foreground">₹{item.amount.toLocaleString()}</span>
    ),
  },
  {
    key: "method",
    label: "Method",
    render: (item: Payout) => (
      <span className="text-muted-foreground">{item.method}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (item: Payout) => {
      const styles = {
        completed: "status-active",
        pending: "status-pending",
        processing: "bg-info/10 text-info border-info/20",
      };
      return (
        <Badge variant="outline" className={styles[item.status as keyof typeof styles]}>
          {item.status}
        </Badge>
      );
    },
  },
  {
    key: "date",
    label: "Date",
    render: (item: Payout) => (
      <span className="text-sm text-muted-foreground">{item.formattedDate}</span>
    ),
  },
];

  return (
    <AdminLayout title="Earnings & Reports" subtitle="Track revenue, commissions, and payouts">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Commissions"
            value={stats?.totalCommissionsFormatted || "₹0.00L"}
            change={stats?.totalCommissionsChange || 0}
            icon={IndianRupee}
            variant="primary"
          />
          <StatCard
            title="Pending Payouts"
            value={stats?.pendingPayoutsFormatted || "₹0.00L"}
            change={stats?.pendingPayoutsChange || 0}
            icon={Clock}
            variant="accent"
          />
          <StatCard
            title="Paid Payouts"
            value={stats?.paidPayoutsFormatted || "₹0.00L"}
            change={stats?.paidPayoutsChange || 0}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Growth Rate"
            value={stats?.growthRateFormatted || "0%"}
            change={stats?.growthRateChange || 0}
            icon={TrendingUp}
            variant="info"
          />
        </div>

        {/* Payout History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Payout History</h3>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          <DataTable
            data={payoutHistory}
            columns={payoutColumns}
            searchPlaceholder="Search payouts..."
            searchKey="reseller"
            pageSize={5}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Trend */}
          <div className="admin-card p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Earnings Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly earnings vs payouts</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 90%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <YAxis
                    stroke="hsl(220, 9%, 46%)"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(225, 20%, 90%)",
                      borderRadius: "0.75rem",
                    }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="earnings" fill="hsl(231, 55%, 42%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="payouts" fill="hsl(43, 89%, 61%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Resellers */}
          <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Resellers</h3>
                <p className="text-sm text-muted-foreground">By total earnings</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {topResellers.map((reseller, index) => (
                <div
                  key={reseller.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{reseller.name}</p>
                      <p className="text-sm text-muted-foreground">{reseller.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₹{reseller.earnings.toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className={reseller.payout === "paid" ? "status-active" : "status-pending"}
                    >
                      {reseller.payout}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
