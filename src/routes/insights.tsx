import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Lightbulb, Target, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AsyncState } from "@/components/analytics/AsyncState";
import { Panel } from "@/components/analytics/Panel";
import { analyticsQueries, inr, num, pct } from "@/lib/analytics";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Business Insights — DheerajShop Sales Analytics" },
      {
        name: "description",
        content:
          "Automated observations and recommendations derived from DheerajShop's delivered-order revenue, category mix, inventory risk and payment behaviour.",
      },
      { property: "og:title", content: "Business Insights — DheerajShop" },
      {
        property: "og:description",
        content:
          "Data-driven findings on revenue concentration, inventory risk and fulfilment leakage.",
      },
    ],
  }),
  component: InsightsPage,
});

type Insight = {
  title: string;
  body: string;
  tone: "positive" | "warning" | "neutral";
};

function InsightsPage() {
  const overview = useQuery(analyticsQueries.overview());
  const categories = useQuery(analyticsQueries.categoryPerformance());
  const products = useQuery(analyticsQueries.productRevenue());
  const customers = useQuery(analyticsQueries.topCustomers());
  const cities = useQuery(analyticsQueries.cityRevenue());
  const payments = useQuery(analyticsQueries.paymentMethods());
  const lowStock = useQuery(analyticsQueries.lowStock());
  const neverOrdered = useQuery(analyticsQueries.neverOrdered());
  const status = useQuery(analyticsQueries.orderStatus());

  const isLoading =
    overview.isPending ||
    categories.isPending ||
    products.isPending ||
    customers.isPending ||
    payments.isPending ||
    status.isPending;
  const isError =
    overview.isError || categories.isError || products.isError || customers.isError;

  const kpi = overview.data;
  const categoryRows = categories.data ?? [];
  const productRows = products.data ?? [];
  const customerRows = customers.data ?? [];
  const cityRows = cities.data ?? [];
  const paymentRows = payments.data ?? [];
  const statusRows = status.data ?? [];

  const insights: Insight[] = [];

  const salesValue = categoryRows.reduce((sum, row) => sum + Number(row.revenue), 0);
  const paidRevenue = Number(kpi?.total_revenue ?? 0);
  if (kpi && salesValue > 0) {
    const gap = Math.abs(paidRevenue - salesValue);
    const paidHigher = paidRevenue > salesValue;
    insights.push({
      title: paidHigher
        ? "Collected payments exceed catalogue sales value"
        : "Collected payments trail catalogue sales value",
      body: `Delivered orders carry a sales value of ${inr(salesValue)} (quantity × price) while ${inr(
        paidRevenue,
      )} was actually collected through payments — a gap of ${inr(gap)}. ${
        paidHigher
          ? "Payment amounts include charges the line items do not (shipping, taxes or rounding), so never substitute one figure for the other."
          : "Discounts or uncollected balances explain the shortfall; reconcile before treating either figure as final revenue."
      }`,
      tone: gap > salesValue * 0.05 ? "warning" : "neutral",
    });
  }

  const topCategory = [...categoryRows].sort((a, b) => Number(b.revenue) - Number(a.revenue))[0];
  const categoryTotal = categoryRows.reduce((sum, row) => sum + Number(row.revenue), 0);
  if (topCategory && categoryTotal > 0) {
    const share = (Number(topCategory.revenue) / categoryTotal) * 100;
    insights.push({
      title: `${topCategory.category} drives ${pct(share)} of sales value`,
      body: `${topCategory.category} contributes ${inr(topCategory.revenue)} across ${num(
        topCategory.units_sold,
      )} units. ${
        share > 40
          ? "That concentration is a risk: a supply or demand shock in this single category would hit most of the top line."
          : "The category mix is reasonably balanced, which cushions demand swings in any one line."
      }`,
      tone: share > 40 ? "warning" : "positive",
    });
  }

  const topProduct = productRows[0];
  if (topProduct) {
    insights.push({
      title: `${topProduct.product_name} is the revenue leader`,
      body: `It generated ${inr(topProduct.revenue)} from ${num(
        topProduct.units_sold,
      )} delivered units in ${topProduct.category}. Protect its stock cover first — a stockout here costs more than anywhere else in the catalogue.`,
      tone: "positive",
    });
  }

  const topCustomer = customerRows[0];
  const customerTotal = customerRows.reduce((sum, row) => sum + Number(row.total_spent), 0);
  if (topCustomer && customerTotal > 0) {
    const share = (Number(topCustomer.total_spent) / customerTotal) * 100;
    insights.push({
      title: `Top customer accounts for ${pct(share)} of collected revenue`,
      body: `${topCustomer.name} from ${topCustomer.city} paid ${inr(
        topCustomer.total_spent,
      )}. High-value buyers like this justify a retention offer; losing one materially moves the monthly total at this order volume.`,
      tone: share > 20 ? "warning" : "neutral",
    });
  }

  const cancelled = Number(kpi?.cancelled_orders ?? 0);
  const pending = Number(kpi?.pending_orders ?? 0);
  const totalOrders = Number(kpi?.total_orders ?? 0);
  if (totalOrders > 0 && cancelled + pending > 0) {
    const lostShare = ((cancelled + pending) / totalOrders) * 100;
    insights.push({
      title: `${pct(lostShare)} of orders never reached Delivered`,
      body: `${num(cancelled)} cancelled and ${num(
        pending,
      )} pending orders sit outside every revenue metric, because revenue counts Delivered orders only. Clearing the pending queue is the fastest available revenue lift — no new demand required.`,
      tone: "warning",
    });
  }

  const topPayment = paymentRows[0];
  if (topPayment) {
    insights.push({
      title: `${topPayment.payment_mode} is the preferred payment mode`,
      body: `It handled ${inr(topPayment.revenue)} across ${num(
        topPayment.transactions,
      )} delivered payments. Any downtime or fee change on this rail affects the majority of collections, so keep a tested fallback mode live.`,
      tone: "neutral",
    });
  }

  const lowStockRows = lowStock.data ?? [];
  if (lowStockRows.length > 0) {
    insights.push({
      title: `${num(lowStockRows.length)} products are below 50 units of stock`,
      body: `Lowest cover: ${lowStockRows
        .slice(0, 3)
        .map((row) => `${row.product_name} (${num(row.stock)})`)
        .join(", ")}. Reorder these before they turn into missed delivered orders.`,
      tone: "warning",
    });
  }

  const neverRows = neverOrdered.data ?? [];
  if (neverRows.length > 0) {
    insights.push({
      title: `${num(neverRows.length)} products have never been ordered`,
      body: `${neverRows
        .slice(0, 3)
        .map((row) => row.product_name)
        .join(", ")}${neverRows.length > 3 ? " and others" : ""} hold stock without generating a single order line. Either promote them deliberately or clear the working capital they tie up.`,
      tone: "warning",
    });
  }

  const topCity = cityRows[0];
  if (topCity) {
    insights.push({
      title: `${topCity.city} is the strongest market`,
      body: `Customers in ${topCity.city} paid ${inr(
        topCity.city_revenue,
      )} across delivered orders. Concentrating delivery capacity and local marketing here compounds an already-proven demand pocket.`,
      tone: "positive",
    });
  }

  const toneStyles: Record<Insight["tone"], { badge: string; icon: typeof TrendingUp }> = {
    positive: { badge: "border-success/40 bg-success/12 text-success", icon: TrendingUp },
    warning: { badge: "border-warning/40 bg-warning/12 text-warning", icon: AlertTriangle },
    neutral: { badge: "border-primary/40 bg-primary/12 text-primary", icon: Target },
  };

  return (
    <AppShell
      title="Business Insights"
      subtitle="Observations generated from the live SQL analyses — no hardcoded commentary."
    >
      <Panel
        title="What the data says"
        description="Each finding is recomputed from the same views that power the dashboard, so it always matches the numbers shown elsewhere."
        tag="derived"
      >
        <AsyncState isLoading={isLoading} isError={isError} isEmpty={insights.length === 0}>
          <div className="grid gap-4 lg:grid-cols-2">
            {insights.map((insight) => {
              const tone = toneStyles[insight.tone];
              const Icon = tone.icon;
              return (
                <article
                  key={insight.title}
                  className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/35"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone.badge}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {insight.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {insight.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </AsyncState>
      </Panel>

      <Panel
        title="Business rules behind every number"
        description="The exact assumptions carried over from the original SQL analysis."
        tag="source of truth"
      >
        <ul className="grid gap-3 text-sm text-muted-foreground lg:grid-cols-2">
          {[
            "Revenue counts Delivered orders only — Pending and Cancelled orders are excluded everywhere.",
            "Paid revenue uses payments.amount; sales value uses order_items.quantity × products.price. They are reported separately, never merged.",
            "Top products per category are ranked with ROW_NUMBER() OVER (PARTITION BY category ORDER BY SUM(quantity) DESC), keeping ranks 1-3.",
            "Average order value is the average delivered payment amount, not sales value divided by orders.",
            "Low stock means products.stock < 50; never-ordered products come from a LEFT JOIN with a NULL order_items match.",
            `Order status shares are computed over all ${num(statusRows.reduce((sum, row) => sum + Number(row.total_orders), 0))} orders in the dataset.`,
          ].map((rule) => (
            <li
              key={rule}
              className="flex gap-2.5 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
