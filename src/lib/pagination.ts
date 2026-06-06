export type PaginationState<T> = {
  items: T[];
  totalItems: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function normalizePage(value: string | number | null | undefined) {
  const page = typeof value === "number" ? value : Number(value ?? 1);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export function paginateItems<T>(items: T[], page: string | number | null | undefined, pageSize: number): PaginationState<T> {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : Math.max(1, items.length);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const currentPage = Math.min(pageCount, normalizePage(page));
  const start = (currentPage - 1) * safePageSize;
  const visibleItems = items.slice(start, start + safePageSize);

  return {
    items: visibleItems,
    totalItems: items.length,
    pageSize: safePageSize,
    pageCount,
    currentPage,
    startIndex: visibleItems.length > 0 ? start + 1 : 0,
    endIndex: start + visibleItems.length,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < pageCount,
  };
}
