CREATE TABLE public.customers (
  customer_id  SERIAL PRIMARY KEY,
  name         VARCHAR(100),
  email        VARCHAR(150) UNIQUE,
  city         VARCHAR(50),
  signup_date  DATE
);
CREATE TABLE public.products (
  product_id   SERIAL PRIMARY KEY,
  product_name VARCHAR(100),
  category     VARCHAR(50),
  price        NUMERIC(10,2),
  stock        INT
);
CREATE TABLE public.orders (
  order_id     SERIAL PRIMARY KEY,
  customer_id  INT REFERENCES public.customers(customer_id),
  order_date   DATE,
  order_status VARCHAR(30)
);
CREATE TABLE public.order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id      INT REFERENCES public.orders(order_id),
  product_id    INT REFERENCES public.products(product_id),
  quantity      INT
);
CREATE TABLE public.payments (
  payment_id   SERIAL PRIMARY KEY,
  order_id     INT REFERENCES public.orders(order_id),
  payment_mode VARCHAR(30),
  amount       NUMERIC(10,2),
  payment_date DATE
);

GRANT SELECT ON public.customers, public.products, public.orders, public.order_items, public.payments TO anon, authenticated;
GRANT ALL ON public.customers, public.products, public.orders, public.order_items, public.payments TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read payments" ON public.payments FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.customers (name, email, city, signup_date) VALUES
('Amit Sharma', 'amit@gmail.com', 'Delhi', '2025-01-01'),
('Neha Verma', 'neha@gmail.com', 'Mumbai', '2025-01-02'),
('Rahul Khan', 'rahul@gmail.com', 'Bangalore', '2025-01-03'),
('Pooja Nair', 'pooja@gmail.com', 'Chennai', '2025-01-04'),
('Rohit Gupta', 'rohit@gmail.com', 'Delhi', '2025-01-05'),
('Ananya Roy', 'ananya@gmail.com', 'Kolkata', '2025-01-06'),
('Karan Mehta', 'karan@gmail.com', 'Ahmedabad', '2025-01-07'),
('Simran Kaur', 'simran@gmail.com', 'Chandigarh', '2025-01-08'),
('Mohit Jain', 'mohit@gmail.com', 'Jaipur', '2025-01-09'),
('Sneha Patel', 'sneha@gmail.com', 'Surat', '2025-01-10'),
('Vikram Singh', 'vikram@gmail.com', 'Lucknow', '2025-01-11'),
('Alok Mishra', 'alok@gmail.com', 'Patna', '2025-01-12'),
('Nidhi Agarwal', 'nidhi@gmail.com', 'Noida', '2025-01-13'),
('Saurabh Verma', 'saurabh@gmail.com', 'Ghaziabad', '2025-01-14'),
('Riya Sen', 'riya@gmail.com', 'Pune', '2025-01-15'),
('Aditya Malhotra', 'aditya@gmail.com', 'Delhi', '2025-01-16'),
('Kritika Shah', 'kritika@gmail.com', 'Mumbai', '2025-01-17'),
('Yash Tiwari', 'yash@gmail.com', 'Kanpur', '2025-01-18'),
('Mehul Joshi', 'mehul@gmail.com', 'Vadodara', '2025-01-19'),
('Isha Kapoor', 'isha@gmail.com', 'Gurgaon', '2025-01-20');

INSERT INTO public.products (product_name, category, price, stock) VALUES
('Python Hoodie', 'Clothing', 1999, 50),
('Java Hoodie', 'Clothing', 1899, 40),
('Debugging Mug', 'Accessories', 599, 100),
('Code Like Pro Mug', 'Accessories', 649, 80),
('DSA Notebook', 'Stationery', 499, 150),
('SQL Cheat Sheet', 'Stationery', 299, 200),
('Sticker Pack', 'Stationery', 249, 300),
('Algorithm T-Shirt', 'Clothing', 1499, 60),
('GitHub Cap', 'Accessories', 799, 70),
('Keyboard Mat', 'Accessories', 999, 90),
('Linux Hoodie', 'Clothing', 2099, 35),
('AI Nerd T-Shirt', 'Clothing', 1599, 55),
('Whiteboard Notebook', 'Stationery', 699, 120),
('Bug Hunter Mug', 'Accessories', 549, 100),
('Terminal Stickers', 'Stationery', 199, 250),
('Coder Bottle', 'Accessories', 899, 110),
('Late Night Hoodie', 'Clothing', 2199, 30),
('Python Socks', 'Accessories', 349, 140),
('DSA Flash Cards', 'Stationery', 349, 180),
('Clean Code Notebook', 'Stationery', 599, 130);

INSERT INTO public.orders (customer_id, order_date, order_status) VALUES
(1, '2025-02-01', 'Delivered'),
(2, '2025-02-02', 'Delivered'),
(3, '2025-02-03', 'Delivered'),
(4, '2025-02-04', 'Cancelled'),
(5, '2025-02-05', 'Delivered'),
(6, '2025-02-06', 'Pending'),
(7, '2025-02-07', 'Delivered'),
(8, '2025-02-08', 'Delivered'),
(9, '2025-02-09', 'Delivered'),
(10, '2025-02-10', 'Cancelled'),
(11, '2025-02-11', 'Delivered'),
(12, '2025-02-12', 'Delivered'),
(13, '2025-02-13', 'Pending'),
(14, '2025-02-14', 'Delivered'),
(15, '2025-02-15', 'Delivered'),
(16, '2025-02-16', 'Delivered'),
(17, '2025-02-17', 'Cancelled'),
(18, '2025-02-18', 'Delivered'),
(19, '2025-02-19', 'Delivered'),
(20, '2025-02-20', 'Delivered');

INSERT INTO public.order_items (order_id, product_id, quantity) VALUES
(1, 1, 2),
(2, 3, 1),
(2, 5, 1),
(3, 8, 1),
(4, 2, 1),
(5, 6, 3),
(6, 4, 1),
(7, 10, 1),
(8, 12, 2),
(9, 15, 3),
(10, 9, 1),
(11, 11, 1),
(12, 13, 1),
(13, 14, 2),
(14, 16, 1),
(15, 17, 1);

INSERT INTO public.payments (order_id, payment_mode, amount, payment_date) VALUES
(1, 'UPI', 2497, '2025-02-01'),
(2, 'Credit Card', 1098, '2025-02-02'),
(3, 'UPI', 1499, '2025-02-03'),
(5, 'Debit Card', 897, '2025-02-05'),
(7, 'UPI', 999, '2025-02-07'),
(8, 'Credit Card', 3198, '2025-02-08'),
(9, 'UPI', 747, '2025-02-09'),
(11, 'UPI', 2099, '2025-02-11'),
(12, 'Debit Card', 699, '2025-02-12'),
(14, 'UPI', 899, '2025-02-14'),
(15, 'Credit Card', 2199, '2025-02-15'),
(16, 'UPI', 798, '2025-02-16'),
(18, 'Debit Card', 599, '2025-02-18'),
(19, 'UPI', 1999, '2025-02-19'),
(20, 'Credit Card', 998, '2025-02-20');

SELECT setval('public.customers_customer_id_seq', (SELECT MAX(customer_id) FROM public.customers));
SELECT setval('public.products_product_id_seq', (SELECT MAX(product_id) FROM public.products));
SELECT setval('public.orders_order_id_seq', (SELECT MAX(order_id) FROM public.orders));
SELECT setval('public.order_items_order_item_id_seq', (SELECT MAX(order_item_id) FROM public.order_items));
SELECT setval('public.payments_payment_id_seq', (SELECT MAX(payment_id) FROM public.payments));

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