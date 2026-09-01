import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Banknote, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
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

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order Analytics — DheerajShop Sales Analytics" },
      {
        name: "description",
        content:
          "Order status distribution, cancelled orders, delivered order metrics and daily revenue for DheerajShop.",
      },
      { property: "og:title", content: "Order Analytics — DheerajShop" },
      {
        property: "og:description",
        content: "Delivered, pending and cancelled order performance with a daily revenue trend.",
      },
    ],
  }),
  component: OrdersPage,
});

const STATUS_COLORS: Record<string, string> = {
  Delivered: "var(--chart-5)",
  Pending: "var(--chart-3)",
  Cancelled: "var(--chart-4)",
};

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Delivered: "border-success/40 bg-success/12 text-success",
    Pending: "border-warning/40 bg-warning/12 text-warning",
    Cancelled: "border-destructive/40 bg-destructive/12 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function OrdersPage() {
  const overview = useQuery(analyticsQueries.overview());
  const status = useQuery(analyticsQueries.orderStatus());
  const daily = useQuery(analyticsQueries.dailyRevenue());
  const orders = useQuery(analyticsQueries.ordersDetail());

  const [statusFilter, setStatusFilter] = useState("All");
  const statusOptions = ["All", ...(status.data ?? []).map((row) => row.order_status)];
  const filteredOrders = (orders.data ?? []).filter(
    (row) => statusFilter === "All" || row.order_status === statusFilter,
  );

  const kpi = overview.data;

  return (
    <AppShell
      title="Order Analytics"
      subtitle="Order book health across Delivered, Pending and Cancelled statuses, plus realized daily revenue."
    >
      <AsyncState
        isLoading={overview.isPending}
        isError={overview.isError}
        isEmpty={!kpi}
        height="min-h-[6rem]"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Delivered Orders"
            value={num(kpi?.delivered_orders)}
            hint="Realized sales"
            icon={CheckCircle2}
            tone="success"
          />
          <KpiCard
            label="Pending Orders"
            value={num(kpi?.pending_orders)}
            hint="Awaiting fulfilment"
            icon={Clock}
            tone="warning"
          />
          <KpiCard
            label="Cancelled Orders"
            value={num(kpi?.cancelled_orders)}
            hint="Excluded from revenue metrics"
            icon={XCircle}
            tone="destructive"
          />
          <KpiCard
            label="Average Order Value"
            value={inr(kpi?.average_order_value)}
            hint="AVG(delivered payment)"
            icon={Banknote}
          />
        </div>
      </AsyncState>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Order Status Distribution"
          description="Count and percentage of orders per status."
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
                    {(status.data ?? []).map((row) => (
                      <Cell
                        key={row.order_status}
                        fill={STATUS_COLORS[row.order_status] ?? "var(--chart-2)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [num(value), "Orders"]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm">
                {(status.data ?? []).map((row) => (
                  <li
                    key={row.order_status}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <StatusBadge status={row.order_status} />
                    <span className="tabular-nums text-muted-foreground">
                      {num(row.total_orders)} · {Number(row.percentage).toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AsyncState>
        </Panel>

        <Panel
          title="Daily Revenue"
          description="Delivered payment revenue per order date."
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
                />
              </LineChart>
            </ResponsiveContainer>
          </AsyncState>
        </Panel>
      </div>

      <Panel
        title="Order Ledger"
        description="Every order with its status, customer city, units and paid amount. Cancelled and pending orders carry no payment record."
        tag="orders"
        actions={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-input bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary/50"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        }
      >
        <AsyncState
          isLoading={orders.isPending}
          isError={orders.isError}
          isEmpty={filteredOrders.length === 0}
        >
          <DataTable
            rows={filteredOrders}
            searchable
            searchPlaceholder="Search customer, city or payment mode…"
            initialSort={{ key: "order_date", ascending: true }}
            maxHeight="max-h-[32rem]"
            columns={[
              {
                key: "order_date",
                header: "Date",
                value: (row) => row.order_date,
                render: (row) => shortDate(row.order_date),
              },
              { key: "customer_name", header: "Customer", value: (row) => row.customer_name },
              { key: "city", header: "City", value: (row) => row.city },
              {
                key: "order_status",
                header: "Status",
                value: (row) => row.order_status,
                render: (row) => <StatusBadge status={row.order_status} />,
              },
              {
                key: "units",
                header: "Units",
                align: "right",
                value: (row) => Number(row.units),
                render: (row) => num(row.units),
              },
              {
                key: "payment_mode",
                header: "Payment Mode",
                value: (row) => row.payment_mode ?? "—",
              },
              {
                key: "paid_amount",
                header: "Paid",
                align: "right",
                value: (row) => Number(row.paid_amount ?? 0),
                render: (row) =>
                  row.paid_amount === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    inr(row.paid_amount)
                  ),
              },
            ]}
          />
        </AsyncState>
      </Panel>
    </AppShell>
  );
}
