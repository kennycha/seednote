import type { RawSeed, Seed, Sprout } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertRowSeedToSeed(row: RawSeed): Seed {
  const sprouts: Sprout[] = (["what", "how", "why"] as const).map((type) => ({
    seed_id: row.id,
    sprout_type: type,
    content: row.sprouts?.[type] ?? { summary: "", core_value: "", examples: [] },
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
  };
}
