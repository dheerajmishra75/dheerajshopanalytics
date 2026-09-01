import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Lightbulb,
  Receipt,
  Users,
  Database,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/insights", label: "Insights", icon: Lightbulb },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid-glow lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">DheerajShop</p>
            <p className="text-xs text-muted-foreground">Sales Analytics</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground border-primary/40",
              }}
              inactiveProps={{ className: "text-muted-foreground border-transparent" }}
              className="flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 lg:block">
          <div className="panel p-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Database className="h-3.5 w-3.5 text-primary" /> SQL-powered
            </p>
            <p className="mt-2 leading-relaxed">
              Every metric is computed by SQL views over the <code>dheerajshop</code> schema —
              customers, products, orders, order_items, payments.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-8">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <p className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
              Dataset: 20 customers · 20 products · 20 orders · Feb 2025
            </p>
          </div>
        </header>
        <main className="space-y-5 px-5 py-6 sm:px-8">{children}</main>
        <footer className="border-t border-border px-5 py-6 text-xs text-muted-foreground sm:px-8">
          DheerajShop — E-Commerce Sales Analytics · 17 SQL analyses · Delivered-order business
          rules preserved from the original MySQL project.
        </footer>
      </div>
    </div>
  );
}
