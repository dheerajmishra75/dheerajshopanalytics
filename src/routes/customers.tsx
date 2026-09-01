import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, MapPin, Repeat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { AsyncState } from "@/components/analytics/AsyncState";
import { Panel } from "@/components/analytics/Panel";
import { DataTable } from "@/components/analytics/DataTable";
import { analyticsQueries, inr, num } from "@/lib/analytics";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customer Analytics — DheerajShop Sales Analytics" },
      {
        name: "description",
        content:
          "Top customers by delivered payment revenue, the highest spending customer and city-level revenue for DheerajShop.",
      },
      { property: "og:title", content: "Customer Analytics — DheerajShop" },
      {
        property: "og:description",
        content: "Customer spend ranking, repeat-order check and city revenue from SQL views.",
      },
    ],
  }),
  component: CustomersPage,
});

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

function CustomersPage() {
  const customers = useQuery(analyticsQueries.topCustomers());
  const cities = useQuery(analyticsQueries.cityRevenue());
  const repeat = useQuery(analyticsQueries.repeatCustomers());

  const highest = (customers.data ?? [])[0];

  return (
    <AppShell
      title="Customer Analytics"
      subtitle="Who spends the most, where revenue comes from, and whether customers order more than once."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Highest Spending Customer"
          description="Largest total delivered payment amount."
          tag="LIMIT 1"
          className="lg:col-span-1"
        >
          <AsyncState
            isLoading={customers.isPending}
            isError={customers.isError}
            isEmpty={!highest}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/12 text-warning">
                <Crown className="h-6 w-6" />
              </span>
              <div>
                <p className="metric-value">{inr(highest?.total_spent)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {highest?.name} · {highest?.city}
                </p>
              </div>
            </div>
          </AsyncState>
        </Panel>

        <Panel
          title="Repeat Customers"
          description="Customers with more than one order (HAVING COUNT(*) > 1)."
          tag="HAVING"
          className="lg:col-span-2"
        >
          <AsyncState
            isLoading={repeat.isPending}
            isError={repeat.isError}
            isEmpty={(repeat.data ?? []).length === 0}
            emptyMessage="No repeat customers found in the current dataset."
          >
            <DataTable
              rows={repeat.data ?? []}
              initialSort={{ key: "repeat_order" }}
              maxHeight="max-h-[14rem]"
              columns={[
                { key: "name", header: "Customer", value: (row) => row.name },
                { key: "city", header: "City", value: (row) => row.city },
                {
                  key: "repeat_order",
                  header: "Orders",
                  align: "right",
                  value: (row) => Number(row.repeat_order),
                  render: (row) => (
                    <span className="inline-flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5 text-primary" />
                      {num(row.repeat_order)}
                    </span>
                  ),
                },
              ]}
            />
          </AsyncState>
        </Panel>
      </div>

      <Panel
        title="Top Customers by Revenue"
        description="Delivered payment revenue per customer, highest to lowest."
        tag="payments.amount"
      >
        <AsyncState
          isLoading={customers.isPending}
          isError={customers.isError}
          isEmpty={(customers.data ?? []).length === 0}
        >
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(customers.data ?? []).slice(0, 10)}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={120}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [inr(value), "Spent"]} />
                <Bar dataKey="total_spent" radius={[0, 6, 6, 0]} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
            <DataTable
              rows={customers.data ?? []}
              searchable
              searchPlaceholder="Search customers or cities…"
              initialSort={{ key: "total_spent" }}
              columns={[
                { key: "name", header: "Customer", value: (row) => row.name },
                { key: "city", header: "City", value: (row) => row.city },
                {
                  key: "total_spent",
                  header: "Revenue",
                  align: "right",
                  value: (row) => Number(row.total_spent),
                  render: (row) => inr(row.total_spent),
                },
              ]}
            />
          </div>
        </AsyncState>
      </Panel>

      <Panel
        title="Customer City Revenue"
        description="Delivered payment revenue grouped by customer city."
        tag="GROUP BY city"
      >
        <AsyncState
          isLoading={cities.isPending}
          isError={cities.isError}
          isEmpty={(cities.data ?? []).length === 0}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(cities.data ?? []).map((row) => (
              <div
                key={row.city}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/35"
              >
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {row.city}
                </span>
                <span className="text-sm font-medium tabular-nums">{inr(row.city_revenue)}</span>
              </div>
            ))}
          </div>
        </AsyncState>
      </Panel>
    </AppShell>
  );
}
