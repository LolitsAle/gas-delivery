import { NextResponse } from "next/server";

export type ListQuery = {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
};

export const parseListQuery = (url: string, defaults?: Partial<ListQuery>) => {
  const { searchParams } = new URL(url);

  const page = Math.max(Number(searchParams.get("page") || defaults?.page || 1), 1);
  const pageSize = Math.min(
    Math.max(Number(searchParams.get("pageSize") || defaults?.pageSize || 10), 1),
    100,
  );

  return {
    page,
    pageSize,
    search: searchParams.get("search") || defaults?.search || "",
    sort: searchParams.get("sort") || defaults?.sort || "createdAt:desc",
    searchParams,
  };
};

export const listResponse = <T>(
  items: T[],
  page: number,
  pageSize: number,
  totalItems: number,
) =>
  NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
  });

export const apiError = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });
