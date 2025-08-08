import type { RawSeed, Seed } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 안전한 배열 파싱 헬퍼
export function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((s) => s.trim());
  return [];
}

export function convertRowSeedToSeed(row: RawSeed): Seed {
  return {
    id: row.id,
    title: row.title,
    context: row.context,
    sprouts: row.sprouts
      ? {
          moscow_requirements: row.sprouts.moscow_requirements,
          stack_recommendations: row.sprouts.stack_recommendations,
        }
      : null,
    status: row.status,
    created_at: row.created_at,
    is_hidden: row.is_hidden,
    is_pinned: row.is_pinned,
  };
}
