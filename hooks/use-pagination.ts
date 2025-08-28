import { useMemo } from "react";

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

interface UsePaginationReturn {
  paginationRange: (number | string)[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

export const usePagination = ({
  currentPage,
  totalPages,
  siblingCount = 1,
}: UsePaginationProps): UsePaginationReturn => {
  const paginationRange = useMemo(() => {
    const totalNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2 dots
    const totalBlocks = totalNumbers + 2; // +2 for dots

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "...", ...middleRange, "...", totalPages];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return {
    paginationRange,
    isFirstPage,
    isLastPage,
  };
};
