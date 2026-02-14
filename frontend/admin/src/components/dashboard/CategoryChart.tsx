import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getCategoryDistribution } from "@/services/dashboardService";

const colors = [
  "hsl(231, 55%, 42%)",
  "hsl(43, 89%, 61%)",
  "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)"
];

export function CategoryChart() {
  // Fetch category distribution
  const { data: categoryData = [] } = useQuery({
    queryKey: ['categoryDistribution'],
    queryFn: getCategoryDistribution
  });

  // Add colors to data
  const data = categoryData.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  return (
    <div className="admin-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue by Category</h3>
        <p className="text-sm text-muted-foreground">Product category distribution</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(225, 20%, 90%)",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, "Share"]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
