import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  height?: string;
  children: ReactNode;
};

/** Uniform loading / error / empty handling for every data-driven section. */
export function AsyncState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data available for the selected filters.",
  height = "min-h-[8rem]",
  children,
}: Props) {
  if (isLoading) {
    return (
      <div
        className={`flex ${height} items-center justify-center gap-2 text-sm text-muted-foreground`}
      >
        <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
      </div>
    );
  }
  if (isError) {
    return (
      <div
        className={`flex ${height} flex-col items-center justify-center gap-2 text-sm text-destructive`}
      >
        <AlertTriangle className="h-5 w-5" />
        Unable to load analytics data.
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div
        className={`flex ${height} flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground`}
      >
        <Inbox className="h-5 w-5" />
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}
