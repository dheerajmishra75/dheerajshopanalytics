# DheerajShop — E-Commerce Sales Analytics Dashboard

A full-stack sales analytics dashboard for a fictional Indian e-commerce store. The
original MySQL project (schema, seed data and 17 analysis queries) is the source of
truth; every metric shown in the UI is computed in SQL, never re-derived in
JavaScript.

## Stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TanStack Router (file-based routes), Tailwind CSS v4 |
| Charts | Recharts |
| Data fetching | TanStack Query |
| Backend / API | Lovable Cloud (managed PostgreSQL + auto-generated data API) |
| Build | Vite 7 |

## Business rules (preserved exactly)

1. **Revenue counts Delivered orders only.** Pending and Cancelled orders are
   excluded from every revenue, product and customer metric.
2. **Paid revenue vs sales value are separate figures.** Paid revenue is
   `SUM(payments.amount)`; sales value is `SUM(order_items.quantity * products.price)`.
   They are reported side by side and never merged.
3. **Ranking uses window functions.** Top 3 products per category come from
   `ROW_NUMBER() OVER (PARTITION BY category ORDER BY SUM(quantity) DESC)`.
4. **Average order value** is `AVG(payments.amount)` over delivered orders.
5. **Inventory rules:** low stock is `products.stock < 50`; never-ordered products
   come from a `LEFT JOIN order_items ... WHERE order_items.product_id IS NULL`.

## Database

Five tables: `customers`, `products`, `orders`, `order_items`, `payments`.

The 17 analyses live as PostgreSQL views (`v_*`), so the SQL — not the frontend —
owns the business logic. The frontend simply selects from a view.

| File | Purpose |
| --- | --- |
| `database/schema.sql` | Table definitions |
| `database/seed.sql` | Original 20 customers / 20 products / 20 orders dataset |
| `database/analysis.sql` | The 17 analysis queries as authored |
| `database/views.sql` | Those queries wrapped as `v_*` views used by the app |

## Analyses → UI mapping

| # | Analysis | Where it appears |
| --- | --- | --- |
| 1 | Total revenue (delivered) | Dashboard KPI |
| 2 | Product-wise revenue | Products |
| 3 | Top customers by revenue | Customers |
| 4 | Best-selling products by units | Dashboard + Products |
| 5 | Total units sold | Dashboard KPI |
| 6 | Order status distribution | Dashboard + Orders |
| 7 | Average order value | Dashboard + Orders KPI |
| 8 | Revenue by payment mode | Dashboard |
| 9 | Category performance | Products |
| 10 | City-wise revenue | Dashboard + Customers |
| 11 | Top 5 products by revenue | Dashboard |
| 12 | Low-stock products | Products |
| 13 | Repeat customers | Customers |
| 14 | Products never ordered | Products |
| 15 | Highest spending customer | Customers |
| 16 | Category revenue contribution % | Dashboard |
| 17 | Top 3 products per category | Products |

## Pages

- **Dashboard** — KPI overview, daily revenue trend, category and payment mix, top products.
- **Products** — product revenue, best sellers, top 3 per category, low stock, never ordered.
- **Customers** — top spenders, highest spender, repeat customers, city revenue.
- **Orders** — status distribution, daily revenue, full order ledger with filters.
- **Insights** — observations recomputed live from the same views.

## Local development

```bash
bun install
bun run dev
```

The backend connection variables are provisioned automatically; see `.env.example`
for the shape of the environment.
