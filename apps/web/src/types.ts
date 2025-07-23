// Seednote 데이터 모델 타입 정의

export type SeedStatus = "pending" | "processing" | "done" | "error";
export type SproutType = "what" | "how" | "why";

export interface RawSeed {
  id: string;
  title: string;
  context: string;
  sprouts: {
    how: SproutContent | null;
    why: SproutContent | null;
    what: SproutContent | null;
  };
  status: SeedStatus;
  created_at: string;
  is_hidden: boolean;
}

export interface SproutContent {
  summary: string;
  core_value: string;
  examples: string[];
}

// seeds 테이블 구조
export interface Seed {
  id: string;
  title: string;
  context: string | null;
  sprouts: Sprout[] | null;
  status: SeedStatus;
  created_at: string;
  is_hidden: boolean;
}

// SproutJSON v1.0 스키마
export interface Sprout {
  seed_id: string;
  sprout_type: SproutType;
  content: {
    summary: string;
    core_value: string;
    examples: string[];
  };
  meta: {
    created_at: string;
  };
}

// 새 Seed 생성 시 사용하는 타입
export interface CreateSeedInput {
  title: string;
  context?: string;
}

// Supabase Realtime 이벤트 타입
export interface RealtimeSeedUpdate {
  new: Seed;
  old: Seed | null;
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

// 인증 관련 타입
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  confirmPassword: string;
}
