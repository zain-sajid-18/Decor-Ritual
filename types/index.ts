/**
 * Foundational and domain type exports for ZF Store
 */

export * from "./product";
export * from "./category";
export * from "./admin";

export type PageProps<T = Record<string, string>> = {
  params: Promise<T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
