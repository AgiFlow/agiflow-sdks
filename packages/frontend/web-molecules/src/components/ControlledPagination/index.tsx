'use client';
import React, { useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@agiflowai/frontend-web-atoms';

interface ControlledPaginationProps {
  currentPage: number;
  totalPage: number;
  pageShown: number;
  getHref?: (index: number) => string;
  onNavigate?: (index: number) => void;
  className?: string;
}

export const ControlledPagination = (props: ControlledPaginationProps) => {
  const { pages, hasEndEllipisis, hasStartEllipsis, prev, next } = useMemo(() => {
    const middlePage = Math.ceil(props.pageShown / 2);
    const prev = props.currentPage - 1 > 1 ? props.currentPage - 1 : 1;
    const next = props.currentPage + 1 < props.totalPage ? props.currentPage + 1 : props.totalPage;
    let pages: number[] = [];
    let hasStartEllipsis = false;
    let hasEndEllipisis = false;
    if (props.currentPage - middlePage < 2) {
      pages = Array.from(new Array(props.pageShown)).map((_, index) => index + 1);
    } else if (props.currentPage + middlePage > props.totalPage) {
      pages = Array.from(new Array(props.pageShown))
        .map((_, index) => props.totalPage + 1 - index)
        .reverse();
    } else {
      pages = [
        ...Array.from(new Array(middlePage))
          .map((_, index) => props.currentPage - index)
          .reverse(),
        props.currentPage,
        ...Array.from(new Array(middlePage)).map((_, index) => props.currentPage + index),
      ];
      pages = Array.from(new Set(pages));
    }
    if (pages[0] === 0) {
      pages.shift();
    }
    if (pages[pages.length - 1] > props.totalPage) {
      pages.pop();
    }
    if (pages[pages.length - 1] < props.totalPage - 1) {
      hasEndEllipisis = true;
    }
    if (pages[0] > 2) {
      hasStartEllipsis = true;
    }
    if (props.totalPage === 1) {
      return {
        prev: 1,
        next: 1,
        pages: [1],
        hasStartEllipsis: false,
        hasEndEllipisis: false,
      };
    }
    return {
      prev,
      next,
      pages,
      hasStartEllipsis,
      hasEndEllipisis,
    };
  }, [props.currentPage, props.totalPage]);
  return (
    <Pagination className={props.className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={props.getHref?.(prev)}
            onClick={props.onNavigate ? () => props.onNavigate?.(prev) : undefined}
          />
        </PaginationItem>
        {hasStartEllipsis ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        {pages.map(page => (
          <PaginationItem key={`${page}`}>
            <PaginationLink
              isActive={page === props.currentPage}
              href={props.getHref?.(page)}
              onClick={props.onNavigate ? () => props.onNavigate?.(page) : undefined}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {hasEndEllipisis ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext
            href={props.getHref?.(next)}
            onClick={props.onNavigate ? () => props.onNavigate?.(next) : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
