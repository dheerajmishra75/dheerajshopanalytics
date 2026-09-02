import { queryOptions } from "@tanstack/react-query";
import { analyticsSupabase as supabase } from "@/lib/supabase-analytics-client";

/**
 * Data access layer for the DheerajShop analytics dashboard.
 *
 * Every metric below is read from a database view (v_*) whose definition is the
 * SQL from `database/analysis.sql`. No metric is recomputed in JavaScript, so
 * the business rules (Delivered-only filters, paid revenue vs quantity x price
 * sales value) live in SQL exactly as authored.
 */

type Order = { column: string; ascending?: boolean };
type ViewName = Parameters<typeof supabase.from>[0];

async function readView<T>(view: ViewName, order?: Order): Promise<T[]> {
  let query = supabase.from(view).select("*");
  if (order) query = query.order(order.column, { ascending: order.ascending ?? false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export type KpiOverview = {
  total_revenue: number;
  total_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  units_sold: number;
  average_order_value: number | null;
};

export type ProductRevenue = {
  product_name: string;
  category: string;
  revenue: number;
  units_sold: number;
};
export type TopCustomer = { name: string; city: string; total_spent: number };
export type BestSeller = { product_name: string; category: string; units_sold: number };
export type OrderStatusRow = { order_status: string; total_orders: number; percentage: number };
export type PaymentMethodRow = { payment_mode: string; transactions: number; revenue: number };
export type CategoryPerformanceRow = { category: string; units_sold: number; revenue: number };
export type CityRevenueRow = { city: string; city_revenue: number };
export type LowStockRow = { product_name: string; category: string; stock: number };
export type RepeatCustomerRow = { name: string; city: string; repeat_order: number };
export type NeverOrderedRow = { product_name: string; category: string; stock: number };
export type CategoryContributionRow = {
  category: string;
  revenue_contribution: number;
  revenue_contribution_percentage: number;
};
export type Top3Row = {
  category: string;
  product_name: string;
  units_sold: number;
  product_rank: number;
};
export type DailyRevenueRow = { order_date: string; daily_revenue: number; orders: number };
export type OrderDetailRow = {
  order_id: number;
  order_date: string;
  order_status: string;
  customer_name: string;
  city: string;
  payment_mode: string | null;
  paid_amount: number | null;
  units: number;
};

export const analyticsQueries = {
  /** Analysis 1, 5, 7 + dashboard counters */
  overview: () =>
    queryOptions({
      queryKey: ["v_kpi_overview"],
      queryFn: async () => {
        const { data, error } = await supabase.from("v_kpi_overview").select("*").single();
        if (error) throw new Error(error.message);
        return data as unknown as KpiOverview;
      },
    }),
  /** Analysis 2 + 11 (top 5 is the first five rows) */
  productRevenue: () =>
    queryOptions({
      queryKey: ["v_product_revenue"],
      queryFn: () => readView<ProductRevenue>("v_product_revenue", { column: "revenue" }),
    }),
  /** Analysis 3 + 15 (highest spender is the first row) */
  topCustomers: () =>
    queryOptions({
      queryKey: ["v_top_customers"],
      queryFn: () => readView<TopCustomer>("v_top_customers", { column: "total_spent" }),
    }),
  /** Analysis 4 */
  bestSellers: () =>
    queryOptions({
      queryKey: ["v_best_selling_products"],
      queryFn: () => readView<BestSeller>("v_best_selling_products", { column: "units_sold" }),
    }),
  /** Analysis 6 */
  orderStatus: () =>
    queryOptions({
      queryKey: ["v_order_status_breakdown"],
      queryFn: () =>
        readView<OrderStatusRow>("v_order_status_breakdown", { column: "total_orders" }),
    }),
  /** Analysis 8 */
  paymentMethods: () =>
    queryOptions({
      queryKey: ["v_payment_methods"],
      queryFn: () => readView<PaymentMethodRow>("v_payment_methods", { column: "revenue" }),
    }),
  /** Analysis 9 */
  categoryPerformance: () =>
    queryOptions({
      queryKey: ["v_category_performance"],
      queryFn: () =>
        readView<CategoryPerformanceRow>("v_category_performance", { column: "revenue" }),
    }),
  /** Analysis 10 */
  cityRevenue: () =>
    queryOptions({
      queryKey: ["v_city_revenue"],
      queryFn: () => readView<CityRevenueRow>("v_city_revenue", { column: "city_revenue" }),
    }),
  /** Analysis 12 */
  lowStock: () =>
    queryOptions({
      queryKey: ["v_low_stock_products"],
      queryFn: () =>
        readView<LowStockRow>("v_low_stock_products", { column: "stock", ascending: true }),
    }),
  /** Analysis 13 — legitimately empty for the current dataset */
  repeatCustomers: () =>
    queryOptions({
      queryKey: ["v_repeat_customers"],
      queryFn: () => readView<RepeatCustomerRow>("v_repeat_customers", { column: "repeat_order" }),
    }),
  /** Analysis 14 */
  neverOrdered: () =>
    queryOptions({
      queryKey: ["v_never_ordered_products"],
      queryFn: () => readView<NeverOrderedRow>("v_never_ordered_products", { column: "stock" }),
    }),
  /** Analysis 16 */
  categoryContribution: () =>
    queryOptions({
      queryKey: ["v_category_contribution"],
      queryFn: () =>
        readView<CategoryContributionRow>("v_category_contribution", {
          column: "revenue_contribution",
        }),
    }),
  /** Analysis 17 — ROW_NUMBER() OVER (PARTITION BY category ...) */
  top3PerCategory: () =>
    queryOptions({
      queryKey: ["v_top3_products_per_category"],
      queryFn: () =>
        readView<Top3Row>("v_top3_products_per_category", {
          column: "category",
          ascending: true,
        }).then((rows) =>
          [...rows].sort(
            (a, b) => a.category.localeCompare(b.category) || a.product_rank - b.product_rank,
          ),
        ),
    }),
  /** Supporting: daily delivered revenue trend */
  dailyRevenue: () =>
    queryOptions({
      queryKey: ["v_daily_revenue"],
      queryFn: () =>
        readView<DailyRevenueRow>("v_daily_revenue", { column: "order_date", ascending: true }),
    }),
  /** Supporting: order ledger for the Orders page */
  ordersDetail: () =>
    queryOptions({
      queryKey: ["v_orders_detail"],
      queryFn: () =>
        readView<OrderDetailRow>("v_orders_detail", { column: "order_date", ascending: true }),
    }),
};

export const inr = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(value));

export const num = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : new Intl.NumberFormat("en-IN").format(Number(value));

export const pct = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
