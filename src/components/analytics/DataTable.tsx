import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  value: (row: T) => string | number | null;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
};

export function DataTable<T>({
  rows,
  columns,
  searchable = false,
  searchPlaceholder = "Search…",
  initialSort,
  maxHeight = "max-h-[26rem]",
}: {
  rows: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  initialSort?: { key: string; ascending?: boolean };
  maxHeight?: string;
}) {
  const [sort, setSort] = useState<{ key: string; ascending: boolean } | null>(
    initialSort ? { key: initialSort.key, ascending: initialSort.ascending ?? false } : null,
  );
  const [term, setTerm] = useState("");

  const visible = useMemo(() => {
    let out = [...rows];
    if (term.trim()) {
      const q = term.trim().toLowerCase();
      out = out.filter((row) =>
        columns.some((col) => String(col.value(row) ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        out.sort((a, b) => {
          const av = col.value(a);
          const bv = col.value(b);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av ?? "").localeCompare(String(bv ?? ""));
          return sort.ascending ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, columns, sort, term]);

  return (
    <div className="space-y-3">
      {searchable ? (
        <div className="relative max-w-xs">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-input bg-surface py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/25"
          />
        </div>
      ) : null}

      <div className={`overflow-auto rounded-lg border border-border ${maxHeight}`}>
        <table className="w-full min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-[1] bg-surface">
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={`border-b border-border px-3 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.sortable === false ? (
                      col.header
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSort({ key: col.key, ascending: active ? !sort!.ascending : false })
                        }
                        className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
                          active ? "text-primary" : ""
                        }`}
                      >
                        {col.header}
                        {active ? (
                          sort!.ascending ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : null}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={index} className="transition-colors hover:bg-accent/45">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border-b border-border/60 px-3 py-2.5 ${
                      col.align === "right" ? "text-right tabular-nums" : ""
                    }`}
                  >
                    {col.render ? col.render(row) : (col.value(row) ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No rows match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
