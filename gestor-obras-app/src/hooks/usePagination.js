import { useState, useMemo } from "react";

export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Se a lista encolher (filtro ou exclusão), não deixa a página atual "sobrar"
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  return {
    pageItems,
    page: currentPage,
    totalPages,
    totalItems: items.length,
    pageSize,
    setPage,
  };
}
