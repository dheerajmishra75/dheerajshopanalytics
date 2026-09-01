import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CircleDollarSign,
  PackageCheck,
  Receipt,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { AsyncState } from "@/components/analytics/AsyncState";
import { KpiCard } from "@/components/analytics/KpiCard";
import { Panel } from "@/components/analytics/Panel";
import { DataTable } from "@/components/analytics/DataTable";
import { analyticsQueries, inr, num, shortDate } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DheerajShop — E-Commerce Sales Analytics Dashboard" },
      {
        name: "description",
        content:
          "SQL-powered business intelligence dashboard for DheerajShop: delivered revenue, category contribution, best sellers, payment mix and city performance.",
      },
      { property: "og:title", content: "DheerajShop — E-Commerce Sales Analytics Dashboard" },
      {
        property: "og:description",
        content:
          "17 SQL analyses over a MySQL-style e-commerce schema, visualised as a modern analytics dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.625rem",
    fontSize: "0.8rem",
    color: "var(--popover-foreground)",
  },
  labelStyle: { color: "var(--muted-foreground)" },
} as const;

function Dashboard() {
  const overview = useQuery(analyticsQueries.overview());
  const daily = useQuery(analyticsQueries.dailyRevenue());
  const category = useQuery(analyticsQueries.categoryPerformance());
  const contribution = useQuery(analyticsQueries.categoryContribution());
  const products = useQuery(analyticsQueries.productRevenue());
  const payments = useQuery(analyticsQueries.paymentMethods());
  const cities = useQuery(analyticsQueries.cityRevenue());
  const status = useQuery(analyticsQueries.orderStatus());
  const bestSellers = useQuery(analyticsQueries.bestSellers());

  const kpi = overview.data;
  const top5 = (products.data ?? []).slice(0, 5);

  return (
    <AppShell
      title="Sales Analytics Overview"
      subtitle="Revenue, orders and product performance derived directly from SQL views over the dheerajshop database."
    >
      <AsyncState
        isLoading={overview.isPending}
        isError={overview.isError}
        isEmpty={!kpi}
        height="min-h-[6rem]"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard
            label="Total Revenue"
            value={inr(kpi?.total_revenue)}
            hint="SUM(payments.amount)"
            icon={CircleDollarSign}
          />
          <KpiCard
            label="Total Orders"
            value={num(kpi?.total_orders)}
            hint="All statuses"
            icon={Receipt}
            tone="muted"
          />
          <KpiCard
            label="Delivered Orders"
            value={num(kpi?.delivered_orders)}
            hint="order_status = 'Delivered'"
            icon={PackageCheck}
            tone="success"
          />
          <KpiCard
            label="Units Sold"
            value={num(kpi?.units_sold)}
            hint="Delivered order items"
            icon={ShoppingBag}
          />
          <KpiCard
            label="Cancelled Orders"
            value={num(kpi?.cancelled_orders)}
            hint="order_status = 'Cancelled'"
            icon={XCircle}
            tone="destructive"
          />
          <KpiCard
            label="Average Order Value"
            value={inr(kpi?.average_order_value)}
            hint="AVG(delivered payment)"
            icon={Banknote}
            tone="warning"
          />
        </div>
      </AsyncState>

      <Panel
        title="Daily Revenue Trend"
        description="Delivered-order payment revenue by order date."
        tag="payments.amount"
      >
        <AsyncState
          isLoading={daily.isPending}
          isError={daily.isError}
          isEmpty={(daily.data ?? []).length === 0}
          height="min-h-[16rem]"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={daily.data ?? []} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="order_date"
                tickFormatter={shortDate}
                stroke="var(--muted-foreground)"
                fontSize={11}
              />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} width={62} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number) => [inr(value), "Revenue"]}
                labelFormatter={(label: string) => shortDate(label)}
              />
              <Line
                type="monotone"
                dataKey="daily_revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--chart-1)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AsyncState>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Revenue by Category"
          description="Delivered sales value = quantity × product price."
          tag="qty × price"
        >
          <AsyncState
            isLoading={category.isPending}
            isError={category.isError}
            isEmpty={(category.data ?? []).length === 0}
            height="min-h-[16rem]"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={category.data ?? []} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={62} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [inr(value), "Revenue"]} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </AsyncState>
        </Panel>

        <Panel
          title="Revenue Contribution by Category"
          description="Category sales value as a share of total delivered sales value (same qty × price metric on both sides)."
          tag="ROUND(%, 2)"
        >
          <AsyncState
            isLoading={contribution.isPending}
            isError={contribution.isError}
            isEmpty={(contribution.data ?? []).length === 0}
            height="min-h-[16rem]"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr] sm:items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={contribution.data ?? []}
                    dataKey="revenue_contribution"
                    nameKey="category"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="var(--background)"
                  >
                    {(contribution.data ?? []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number) => [inr(value), "Sales value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm">
                {(contribution.data ?? []).map((row, index) => (
                  <li
                    key={row.category}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      {row.category}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {Number(row.revenue_contribution_percentage).toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AsyncState>
        </Panel>

        <Panel
          title="Top 5 Products by Revenue"
          description="Highest delivered sales value per product."
          tag="LIMIT 5"
        >
          <AsyncState
            isLoading={products.isPending}
            isError={products.isError}
            isEmpty={top5.length === 0}
            height="min-h-[16rem]"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top5} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={130}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [inr(value), "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </AsyncState>
        </Panel>

        <Panel
          title="Payment Method Analysis"
          description="Delivered transactions and revenue by payment mode."
          tag="payments"
        >
          <AsyncState
            isLoading={payments.isPending}
            isError={payments.isError}
            isEmpty={(payments.data ?? []).length === 0}
            height="min-h-[16rem]"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={payments.data ?? []} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="payment_mode" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={62} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name) => [
                    name === "revenue" ? inr(value) : num(value),
                    name === "revenue" ? "Revenue" : "Transactions",
                  ]}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="var(--chart-3)" />
              </BarChart>
            </ResponsiveContainer>
          </AsyncState>
        </Panel>

        <Panel
          title="City-wise Revenue"
          description="Delivered payment revenue by customer city."
          tag="customers.city"
        >
          <AsyncState
            isLoading={cities.isPending}
            isError={cities.isError}
            isEmpty={(cities.data ?? []).length === 0}
            height="min-h-[16rem]"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cities.data ?? []} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="city"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={90}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [inr(value), "Revenue"]} />
                <Bar dataKey="city_revenue" radius={[0, 6, 6, 0]} fill="var(--chart-5)" />
              </BarChart>
            </ResponsiveContainer>
          </AsyncState>
        </Panel>

        <Panel
          title="Order Status Distribution"
          description="Share of orders by status across the full order book."
          tag="COUNT(*) %"
        >
          <AsyncState
            isLoading={status.isPending}
            isError={status.isError}
            isEmpty={(status.data ?? []).length === 0}
            height="min-h-[16rem]"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr] sm:items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={status.data ?? []}
                    dataKey="total_orders"
                    nameKey="order_status"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="var(--background)"
                  >
                    {(status.data ?? []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [num(value), "Orders"]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm">
                {(status.data ?? []).map((row, index) => (
                  <li
                    key={row.order_status}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      {row.order_status}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {num(row.total_orders)} · {Number(row.percentage).toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AsyncState>
        </Panel>
      </div>

      <Panel
        title="Best-selling Products"
        description="Units sold per product across delivered orders."
        tag="SUM(quantity)"
      >
        <AsyncState
          isLoading={bestSellers.isPending}
          isError={bestSellers.isError}
          isEmpty={(bestSellers.data ?? []).length === 0}
        >
          <DataTable
            rows={bestSellers.data ?? []}
            initialSort={{ key: "units_sold" }}
            columns={[
              { key: "product_name", header: "Product", value: (row) => row.product_name },
              { key: "category", header: "Category", value: (row) => row.category },
              {
                key: "units_sold",
                header: "Units Sold",
                align: "right",
                value: (row) => Number(row.units_sold),
                render: (row) => num(row.units_sold),
              },
            ]}
          />
        </AsyncState>
      </Panel>
    </AppShell>
  );
}
