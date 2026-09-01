-- 17 analyses as views
CREATE VIEW public.v_kpi_overview AS
SELECT
  (SELECT COALESCE(SUM(amount),0) FROM public.payments) AS total_revenue,
  (SELECT COUNT(*) FROM public.orders) AS total_orders,
  (SELECT COUNT(*) FROM public.orders WHERE order_status='Delivered') AS delivered_orders,
  (SELECT COUNT(*) FROM public.orders WHERE order_status='Cancelled') AS cancelled_orders,
  (SELECT COUNT(*) FROM public.orders WHERE order_status='Pending') AS pending_orders,
  (SELECT COALESCE(SUM(oi.quantity),0) FROM public.order_items oi JOIN public.orders o ON o.order_id=oi.order_id WHERE o.order_status='Delivered') AS units_sold,
  (SELECT ROUND(AVG(pay.amount),2) FROM public.payments pay JOIN public.orders o ON pay.order_id=o.order_id WHERE o.order_status='Delivered') AS average_order_value;

CREATE VIEW public.v_product_revenue AS
SELECT p.product_name, p.category, SUM(oi.quantity * p.price) AS revenue, SUM(oi.quantity) AS units_sold
FROM public.order_items oi
JOIN public.products p ON oi.product_id=p.product_id
JOIN public.orders o ON oi.order_id=o.order_id
WHERE o.order_status='Delivered'
GROUP BY p.product_name, p.category
ORDER BY revenue DESC;

CREATE VIEW public.v_top_customers AS
SELECT c.name, c.city, SUM(pay.amount) AS total_spent
FROM public.customers c
JOIN public.orders o ON c.customer_id=o.customer_id
JOIN public.payments pay ON o.order_id=pay.order_id
WHERE o.order_status='Delivered'
GROUP BY c.name, c.city
ORDER BY total_spent DESC;

CREATE VIEW public.v_best_selling_products AS
SELECT p.product_name, p.category, SUM(oi.quantity) AS units_sold
FROM public.order_items oi
JOIN public.products p ON oi.product_id=p.product_id
JOIN public.orders o ON oi.order_id=o.order_id
WHERE o.order_status='Delivered'
GROUP BY p.product_name, p.category
ORDER BY units_sold DESC;

CREATE VIEW public.v_order_status_breakdown AS
SELECT order_status,
       COUNT(*) AS total_orders,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.orders), 2) AS percentage
FROM public.orders
GROUP BY order_status
ORDER BY total_orders DESC;

CREATE VIEW public.v_payment_methods AS
SELECT pay.payment_mode, COUNT(pay.payment_mode) AS transactions, SUM(pay.amount) AS revenue
FROM public.payments pay
JOIN public.orders o ON pay.order_id=o.order_id
WHERE o.order_status='Delivered'
GROUP BY pay.payment_mode
ORDER BY revenue DESC;

CREATE VIEW public.v_category_performance AS
SELECT p.category, SUM(oi.quantity) AS units_sold, SUM(oi.quantity * p.price) AS revenue
FROM public.order_items oi
JOIN public.products p ON oi.product_id=p.product_id
JOIN public.orders o ON oi.order_id=o.order_id
WHERE o.order_status='Delivered'
GROUP BY p.category
ORDER BY revenue DESC;

CREATE VIEW public.v_city_revenue AS
SELECT c.city, SUM(pay.amount) AS city_revenue
FROM public.customers c
JOIN public.orders o ON o.customer_id=c.customer_id
JOIN public.payments pay ON pay.order_id=o.order_id
WHERE o.order_status='Delivered'
GROUP BY c.city
ORDER BY city_revenue DESC;

CREATE VIEW public.v_low_stock_products AS
SELECT product_name, category, stock FROM public.products WHERE stock < 50 ORDER BY stock ASC;

CREATE VIEW public.v_repeat_customers AS
SELECT c.name, c.city, COUNT(*) AS repeat_order
FROM public.customers c
JOIN public.orders o ON o.customer_id=c.customer_id
GROUP BY c.name, c.city
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

CREATE VIEW public.v_never_ordered_products AS
SELECT p.product_name, p.category, p.stock
FROM public.products p
LEFT JOIN public.order_items oi ON p.product_id=oi.product_id
WHERE oi.product_id IS NULL
ORDER BY p.stock DESC;

CREATE VIEW public.v_category_contribution AS
SELECT p.category,
       SUM(oi.quantity * p.price) AS revenue_contribution,
       ROUND(SUM(oi.quantity * p.price) * 100.0 /
         (SELECT SUM(oi2.quantity * p2.price)
          FROM public.order_items oi2
          JOIN public.products p2 ON oi2.product_id=p2.product_id
          JOIN public.orders o2 ON oi2.order_id=o2.order_id
          WHERE o2.order_status='Delivered'), 2) AS revenue_contribution_percentage
FROM public.products p
JOIN public.order_items oi ON oi.product_id=p.product_id
JOIN public.orders o ON o.order_id=oi.order_id
WHERE o.order_status='Delivered'
GROUP BY p.category
ORDER BY revenue_contribution DESC;

CREATE VIEW public.v_top3_products_per_category AS
SELECT category, product_name, units_sold, product_rank
FROM (
  SELECT p.category, p.product_name, SUM(oi.quantity) AS units_sold,
         ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity) DESC) AS product_rank
  FROM public.products p
  JOIN public.order_items oi ON oi.product_id=p.product_id
  JOIN public.orders o ON o.order_id=oi.order_id
  WHERE o.order_status='Delivered'
  GROUP BY p.category, p.product_name
) ranked_products
WHERE product_rank <= 3
ORDER BY category, product_rank;

CREATE VIEW public.v_daily_revenue AS
SELECT o.order_date, SUM(pay.amount) AS daily_revenue, COUNT(*) AS orders
FROM public.orders o
JOIN public.payments pay ON o.order_id=pay.order_id
WHERE o.order_status='Delivered'
GROUP BY o.order_date
ORDER BY o.order_date;

CREATE VIEW public.v_orders_detail AS
SELECT o.order_id, o.order_date, o.order_status, c.name AS customer_name, c.city,
       pay.payment_mode, pay.amount AS paid_amount,
       COALESCE((SELECT SUM(oi.quantity) FROM public.order_items oi WHERE oi.order_id=o.order_id),0) AS units
FROM public.orders o
JOIN public.customers c ON c.customer_id=o.customer_id
LEFT JOIN public.payments pay ON pay.order_id=o.order_id
ORDER BY o.order_date;

GRANT SELECT ON
  public.v_kpi_overview, public.v_product_revenue, public.v_top_customers,
  public.v_best_selling_products, public.v_order_status_breakdown, public.v_payment_methods,
  public.v_category_performance, public.v_city_revenue, public.v_low_stock_products,
  public.v_repeat_customers, public.v_never_ordered_products, public.v_category_contribution,
  public.v_top3_products_per_category, public.v_daily_revenue, public.v_orders_detail
TO anon, authenticated, service_role;
