-- DheerajShop — schema (Postgres port of the original MySQL schema)
CREATE TABLE customers (
  customer_id  SERIAL PRIMARY KEY,
  name         VARCHAR(100),
  email        VARCHAR(150) UNIQUE,
  city         VARCHAR(50),
  signup_date  DATE
);

CREATE TABLE products (
  product_id   SERIAL PRIMARY KEY,
  product_name VARCHAR(100),
  category     VARCHAR(50),
  price        NUMERIC(10,2),
  stock        INT
);

CREATE TABLE orders (
  order_id     SERIAL PRIMARY KEY,
  customer_id  INT REFERENCES customers(customer_id),
  order_date   DATE,
  order_status VARCHAR(30)
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id      INT REFERENCES orders(order_id),
  product_id    INT REFERENCES products(product_id),
  quantity      INT
);

CREATE TABLE payments (
  payment_id   SERIAL PRIMARY KEY,
  order_id     INT REFERENCES orders(order_id),
  payment_mode VARCHAR(30),
  amount       NUMERIC(10,2),
  payment_date DATE
);
