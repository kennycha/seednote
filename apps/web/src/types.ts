// Seednote 데이터 모델 타입 정의

export type SeedStatus = "pending" | "processing" | "done" | "error";
export type SproutType = "stack1" | "stack2" | "stack3";

export interface RawSeed {
  id: string;
  title: string;
  context: string;
  sprouts: {
    moscow_requirements: {
      must_have: string[];
      should_have: string[];
      could_have: string[];
      wont_have: string[];
    };
    stack_recommendations: [StackRecommendation, StackRecommendation, StackRecommendation];
  };
  status: SeedStatus;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
}

export interface StackRecommendation {
  stack_name: string;
  description: string;
  technologies: string[];
  pros: string[];
  cons: string[];
  learning_curve: "Easy" | "Medium" | "Hard";
}

// seeds 테이블 구조
export interface Seed {
  id: string;
  title: string;
  context: string | null;
  sprouts: {
    moscow_requirements: {
      must_have: string[];
      should_have: string[];
      could_have: string[];
      wont_have: string[];
    };
    stack_recommendations: StackRecommendation[];
  } | null;
  status: SeedStatus;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
}

// 새 Seed 생성 시 사용하는 타입
export interface CreateSeedInput {
  title: string;
  context?: string;
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
