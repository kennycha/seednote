// Seednote 데이터 모델 타입 정의

export type SeedStatus = "pending" | "processing" | "done" | "error";
export type SproutType = "stack1" | "stack2" | "stack3";

export interface RawSeed {
  id: string;
  title: string;
  context: string;
  sprouts: {
    stack1: SproutContent | null;
    stack2: SproutContent | null;
    stack3: SproutContent | null;
  };
  status: SeedStatus;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
}

export interface SproutContent {
  stack_name: string;
  description: string;
  technologies: string[];
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
  is_pinned: boolean;
}

// SproutJSON v1.0 스키마
export interface Sprout {
  seed_id: string;
  sprout_type: SproutType;
  content: {
    stack_name: string;
    description: string;
    technologies: string[];
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
