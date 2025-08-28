import React from "react";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const { paginationRange, isFirstPage, isLastPage } = usePagination({
    currentPage,
    totalPages,
    siblingCount,
  });

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={isFirstPage ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
          />
        </PaginationItem>

        {paginationRange.map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={currentPage === pageNumber}
                onClick={() => onPageChange(pageNumber as number)}
                className="cursor-pointer transition-all duration-200 hover:scale-105"
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={isLastPage ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
