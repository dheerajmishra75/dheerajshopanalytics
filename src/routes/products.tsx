import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { AsyncState } from "@/components/analytics/AsyncState";
import { Panel } from "@/components/analytics/Panel";
import { DataTable } from "@/components/analytics/DataTable";
import { analyticsQueries, inr, num } from "@/lib/analytics";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Analytics — DheerajShop Sales Analytics" },
      {
        name: "description",
        content:
          "Product revenue, best sellers, top 3 products per category, low-stock inventory risk and never-ordered products for DheerajShop.",
      },
      { property: "og:title", content: "Product Analytics — DheerajShop" },
      {
        property: "og:description",
        content:
          "Delivered-order product performance, category performance and inventory risk from SQL views.",
      },
    ],
  }),
  component: ProductsPage,
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

function ProductsPage() {
  const products = useQuery(analyticsQueries.productRevenue());
  const bestSellers = useQuery(analyticsQueries.bestSellers());
  const top3 = useQuery(analyticsQueries.top3PerCategory());
  const lowStock = useQuery(analyticsQueries.lowStock());
  const neverOrdered = useQuery(analyticsQueries.neverOrdered());
  const categories = useQuery(analyticsQueries.categoryPerformance());

  const [category, setCategory] = useState("All");
  const categoryOptions = useMemo(
    () => ["All", ...new Set((categories.data ?? []).map((row) => row.category))],
    [categories.data],
  );

  const filteredProducts = (products.data ?? []).filter(
    (row) => category === "All" || row.category === category,
  );

  return (
    <AppShell
      title="Product Analytics"
      subtitle="Delivered-order product performance, category results and inventory risk."
    >
      <Panel
        title="Product-wise Revenue"
        description="Delivered sales value per product (quantity × product price)."
        tag="qty × price"
        actions={
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-input bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary/50"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        }
      >
        <AsyncState
          isLoading={products.isPending}
          isError={products.isError}
          isEmpty={filteredProducts.length === 0}
        >
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={filteredProducts.slice(0, 10)}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={140}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [inr(value), "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
            <DataTable
              rows={filteredProducts}
              searchable
              searchPlaceholder="Search products…"
              initialSort={{ key: "revenue" }}
              columns={[
                { key: "product_name", header: "Product", value: (row) => row.product_name },
                { key: "category", header: "Category", value: (row) => row.category },
                {
                  key: "units_sold",
                  header: "Units",
                  align: "right",
                  value: (row) => Number(row.units_sold),
                  render: (row) => num(row.units_sold),
                },
                {
                  key: "revenue",
                  header: "Revenue",
                  align: "right",
                  value: (row) => Number(row.revenue),
                  render: (row) => inr(row.revenue),
                },
              ]}
            />
          </div>
        </AsyncState>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Best-selling Products by Units"
          description="SUM(order_items.quantity) for delivered orders."
          tag="SUM(quantity)"
        >
          <AsyncState
            isLoading={bestSellers.isPending}
            isError={bestSellers.isError}
            isEmpty={(bestSellers.data ?? []).length === 0}
          >
            <DataTable
              rows={bestSellers.data ?? []}
              searchable
              initialSort={{ key: "units_sold" }}
              columns={[
                { key: "product_name", header: "Product", value: (row) => row.product_name },
                { key: "category", header: "Category", value: (row) => row.category },
                {
                  key: "units_sold",
                  header: "Units",
                  align: "right",
                  value: (row) => Number(row.units_sold),
                  render: (row) => num(row.units_sold),
                },
              ]}
            />
          </AsyncState>
        </Panel>

        <Panel
          title="Top 3 Products in Each Category"
          description="Ranked with ROW_NUMBER() OVER (PARTITION BY category ORDER BY SUM(quantity) DESC)."
          tag="ROW_NUMBER()"
        >
          <AsyncState
            isLoading={top3.isPending}
            isError={top3.isError}
            isEmpty={(top3.data ?? []).length === 0}
          >
            <DataTable
              rows={top3.data ?? []}
              columns={[
                {
                  key: "product_rank",
                  header: "Rank",
                  value: (row) => Number(row.product_rank),
                  render: (row) => (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 font-mono text-xs text-primary">
                      {row.product_rank}
                    </span>
                  ),
                },
                { key: "category", header: "Category", value: (row) => row.category },
                { key: "product_name", header: "Product", value: (row) => row.product_name },
                {
                  key: "units_sold",
                  header: "Units",
                  align: "right",
                  value: (row) => Number(row.units_sold),
                  render: (row) => num(row.units_sold),
                },
              ]}
            />
          </AsyncState>
        </Panel>

        <Panel
          title="Low-stock Products"
          description="Inventory risk: products with stock below 50 units, lowest first."
          tag="stock < 50"
        >
          <AsyncState
            isLoading={lowStock.isPending}
            isError={lowStock.isError}
            isEmpty={(lowStock.data ?? []).length === 0}
            emptyMessage="No products are currently below the 50-unit stock threshold."
          >
            <DataTable
              rows={lowStock.data ?? []}
              initialSort={{ key: "stock", ascending: true }}
              columns={[
                { key: "product_name", header: "Product", value: (row) => row.product_name },
                { key: "category", header: "Category", value: (row) => row.category },
                {
                  key: "stock",
                  header: "Stock",
                  align: "right",
                  value: (row) => Number(row.stock),
                  render: (row) => (
                    <span className="font-medium text-warning">{num(row.stock)}</span>
                  ),
                },
              ]}
            />
          </AsyncState>
        </Panel>

        <Panel
          title="Products Never Ordered"
          description="LEFT JOIN order_items … WHERE order_items.product_id IS NULL — inventory sitting without demand."
          tag="LEFT JOIN"
        >
          <AsyncState
            isLoading={neverOrdered.isPending}
            isError={neverOrdered.isError}
            isEmpty={(neverOrdered.data ?? []).length === 0}
            emptyMessage="Every product has appeared in at least one order."
          >
            <DataTable
              rows={neverOrdered.data ?? []}
              searchable
              initialSort={{ key: "stock" }}
              columns={[
                { key: "product_name", header: "Product", value: (row) => row.product_name },
                { key: "category", header: "Category", value: (row) => row.category },
                {
                  key: "stock",
                  header: "Stock",
                  align: "right",
                  value: (row) => Number(row.stock),
                  render: (row) => num(row.stock),
                },
              ]}
            />
          </AsyncState>
        </Panel>
      </div>

      <Panel
        title="Category Performance"
        description="Units sold and delivered sales value (quantity × price) per category."
        tag="GROUP BY category"
      >
        <AsyncState
          isLoading={categories.isPending}
          isError={categories.isError}
          isEmpty={(categories.data ?? []).length === 0}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categories.data ?? []} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [num(value), "Units"]} />
                <Bar dataKey="units_sold" radius={[6, 6, 0, 0]} fill="var(--chart-4)" />
              </BarChart>
            </ResponsiveContainer>
            <DataTable
              rows={categories.data ?? []}
              initialSort={{ key: "revenue" }}
              maxHeight="max-h-[16rem]"
              columns={[
                { key: "category", header: "Category", value: (row) => row.category },
                {
                  key: "units_sold",
                  header: "Units Sold",
                  align: "right",
                  value: (row) => Number(row.units_sold),
                  render: (row) => num(row.units_sold),
                },
                {
                  key: "revenue",
                  header: "Sales Value",
                  align: "right",
                  value: (row) => Number(row.revenue),
                  render: (row) => inr(row.revenue),
                },
              ]}
            />
          </div>
        </AsyncState>
      </Panel>
    </AppShell>
  );
}
