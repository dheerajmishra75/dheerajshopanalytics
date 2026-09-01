-- ============================================================
-- DheerajShop — 17 Sales Analyses (source of truth)
-- Business rules preserved from the original MySQL analysis:
--   * Realized sales/revenue metrics filter order_status = 'Delivered'
--   * Paid revenue          = payments.amount
--   * Sales value           = order_items.quantity * products.price
--   * The two are never mixed inside one metric
-- In the app these queries are materialised as database views
-- (v_*) so the dashboard reads real SQL results, not JS math.
-- ============================================================

-- 1. TOTAL REVENUE
SELECT SUM(amount) AS total_revenue FROM payments;

-- 2. PRODUCT-WISE REVENUE (delivered, quantity x price)
SELECT p.product_name, SUM(oi.quantity * p.price) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders   o ON oi.order_id  = o.order_id
WHERE o.order_status = 'Delivered'
GROUP BY p.product_name
ORDER BY revenue DESC;

-- 3. TOP CUSTOMERS BY REVENUE (delivered, payment amount)
SELECT c.name, SUM(pay.amount) AS total_spent
FROM customers c
JOIN orders   o   ON c.customer_id = o.customer_id
JOIN payments pay ON o.order_id    = pay.order_id
WHERE o.order_status = 'Delivered'
GROUP BY c.name
ORDER BY total_spent DESC;

-- 4. BEST-SELLING PRODUCTS (units sold, delivered)
SELECT p.product_name, SUM(oi.quantity) AS units_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders   o ON oi.order_id  = o.order_id
WHERE o.order_status = 'Delivered'
GROUP BY p.product_name
ORDER BY units_sold DESC;

-- 5. CANCELLED ORDERS
SELECT COUNT(*) AS cancelled_orders FROM orders WHERE order_status = 'Cancelled';

-- 6. ORDER STATUS PERCENTAGE
SELECT order_status,
       COUNT(*) AS total_orders,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS percentage
FROM orders
GROUP BY order_status;

-- 7. AVERAGE ORDER VALUE (average delivered payment)
SELECT AVG(pay.amount) AS average_order_value
FROM payments pay
JOIN orders o ON pay.order_id = o.order_id
WHERE o.order_status = 'Delivered';

-- 8. PAYMENT METHOD ANALYSIS
SELECT pay.payment_mode,
       COUNT(pay.payment_mode) AS transactions,
       SUM(pay.amount)         AS revenue
FROM payments pay
JOIN orders o ON pay.order_id = o.order_id
WHERE o.order_status = 'Delivered'
GROUP BY pay.payment_mode
ORDER BY revenue DESC;

-- 9. CATEGORY PERFORMANCE (units + quantity x price revenue)
SELECT p.category,
       SUM(oi.quantity)             AS units_sold,
       SUM(oi.quantity * p.price)   AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders   o ON oi.order_id  = o.order_id
WHERE o.order_status = 'Delivered'
GROUP BY p.category
ORDER BY revenue DESC;

-- 10. CITY-WISE REVENUE (delivered, payment amount)
SELECT c.city, SUM(pay.amount) AS city_revenue
FROM customers c
JOIN orders   o   ON o.customer_id = c.customer_id
JOIN payments pay ON pay.order_id  = o.order_id
WHERE o.order_status = 'Delivered'
GROUP BY c.city
ORDER BY city_revenue DESC;

-- 11. TOP 5 PRODUCTS BY REVENUE
SELECT p.product_name, SUM(oi.quantity * p.price) AS revenue
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o       ON o.order_id    = oi.order_id
WHERE o.order_status = 'Delivered'
GROUP BY p.product_name
ORDER BY revenue DESC
LIMIT 5;

-- 12. LOW-STOCK PRODUCTS
SELECT product_name, category, stock
FROM products
WHERE stock < 50
ORDER BY stock ASC;

-- 13. REPEAT CUSTOMERS (may legitimately return zero rows)
SELECT c.name, COUNT(*) AS repeat_order
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.name
HAVING COUNT(*) > 1
ORDER BY repeat_order DESC;

-- 14. PRODUCTS NEVER ORDERED
SELECT p.product_name, p.category, p.stock
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.product_id IS NULL;

-- 15. HIGHEST SPENDING CUSTOMER
SELECT c.name, SUM(pay.amount) AS total_spent
FROM customers c
JOIN orders   o   ON c.customer_id = o.customer_id
JOIN payments pay ON o.order_id    = pay.order_id
WHERE o.order_status = 'Delivered'
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 1;

-- 16. REVENUE CONTRIBUTION BY CATEGORY (quantity x price, same metric top & bottom)
SELECT p.category,
       SUM(oi.quantity * p.price) AS revenue_contribution,
       ROUND(SUM(oi.quantity * p.price) * 100.0 /
         (SELECT SUM(oi2.quantity * p2.price)
          FROM order_items oi2
          JOIN products p2 ON oi2.product_id = p2.product_id
          JOIN orders   o2 ON oi2.order_id   = o2.order_id
          WHERE o2.order_status = 'Delivered'), 2) AS revenue_contribution_percentage
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o       ON o.order_id    = oi.order_id
WHERE o.order_status = 'Delivered'
GROUP BY p.category
ORDER BY revenue_contribution DESC;

-- 17. TOP 3 PRODUCTS IN EACH CATEGORY (ROW_NUMBER + PARTITION BY)
SELECT category, product_name, units_sold, product_rank
FROM (
  SELECT p.category,
         p.product_name,
         SUM(oi.quantity) AS units_sold,
         ROW_NUMBER() OVER (
           PARTITION BY p.category
           ORDER BY SUM(oi.quantity) DESC
         ) AS product_rank
  FROM products p
  JOIN order_items oi ON oi.product_id = p.product_id
  JOIN orders o       ON o.order_id    = oi.order_id
  WHERE o.order_status = 'Delivered'
  GROUP BY p.category, p.product_name
) ranked_products
WHERE product_rank <= 3
ORDER BY category, product_rank;

-- SUPPORTING: DAILY REVENUE TREND (delivered, payment amount)
SELECT o.order_date, SUM(pay.amount) AS daily_revenue
FROM orders o
JOIN payments pay ON o.order_id = pay.order_id
WHERE o.order_status = 'Delivered'
GROUP BY o.order_date
ORDER BY o.order_date;
