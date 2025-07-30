import type { RawSeed, Seed, Sprout } from "@/types";
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

// 안전한 기술스택 파싱 헬퍼
export function safeTechnologies(value: unknown): {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  infrastructure?: string[];
} {
  if (!value) return {};

  // 새 형식 (객체)
  if (typeof value === "object" && !Array.isArray(value)) {
    const tech = value as {
      frontend?: unknown[];
      backend?: unknown[];
      database?: unknown[];
      infrastructure?: unknown[];
    };
    return {
      frontend: safeArray(tech.frontend),
      backend: safeArray(tech.backend),
      database: safeArray(tech.database),
      infrastructure: safeArray(tech.infrastructure),
    };
  }

  // 기존 형식 (배열)
  if (Array.isArray(value)) {
    return { frontend: value };
  }

  return {};
}

export function convertRowSeedToSeed(row: RawSeed): Seed {
  const sprouts: Sprout[] = (["stack1", "stack2", "stack3"] as const).map((type) => ({
    seed_id: row.id,
    sprout_type: type,
    content: row.sprouts?.[type] ?? {
      stack_name: "",
      description: "",
      technologies: [],
      pros: [],
      cons: [],
      learning_curve: "Medium" as const,
    },
    meta: {
      created_at: row.created_at,
      agent: "ollama:llama3:8b", // 또는 실제 모델명
      tokens_used: 0, // 현재 없으면 0으로 설정
    },
  }));

  return {
    id: row.id,
    title: row.title,
    context: row.context,
    sprouts,
    status: row.status,
    created_at: row.created_at,
    is_hidden: row.is_hidden,
    is_pinned: row.is_pinned,
  };
}
