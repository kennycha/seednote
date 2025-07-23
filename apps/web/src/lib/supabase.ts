import { createClient } from "@supabase/supabase-js";
import type { Seed, LoginCredentials, SignUpCredentials, RawSeed } from "../types";
import { convertRowSeedToSeed } from "./utils";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<{
  public: {
    Tables: {
      seeds: {
        Row: Seed;
        Insert: Omit<Seed, "id" | "created_at">;
        Update: Partial<Omit<Seed, "id" | "created_at">>;
      };
    };
  };
}>(supabaseUrl, supabaseAnonKey);

// seeds 테이블 관련 함수들
export const seedsApi = {
  // 모든 seeds 조회
  getAll: async (): Promise<Seed[]> => {
    const { data, error } = await supabase
      .from("seeds")
      .select<"*", RawSeed>("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(convertRowSeedToSeed);
  },

  // 새 seed 생성
  create: async (seed: { title: string; context?: string }) => {
    const { data, error } = await supabase
      .from("seeds")
      .insert({
        title: seed.title,
        context: seed.context || null,
        status: "pending",
        sprouts: null,
        is_hidden: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // seed 업데이트
  update: async (id: string, updates: Partial<Seed>) => {
    const { data, error } = await supabase
      .from("seeds")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // seed의 is_hidden 상태 토글
  toggleHidden: async (id: string, currentHiddenState: boolean): Promise<Seed> => {
    const { data, error } = await supabase
      .from("seeds")
      .update({ is_hidden: !currentHiddenState })
      .eq("id", id)
      .select<"*", RawSeed>("*")
      .single();

    if (error) throw error;
    return convertRowSeedToSeed(data);
  },
};

// 인증 관련 함수들
export const authApi = {
  // 로그인
  signIn: async (credentials: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },

  // 회원가입
  signUp: async (credentials: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // 인증 상태 변경 감지
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
