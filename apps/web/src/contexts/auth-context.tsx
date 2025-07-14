import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { authApi } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 사용자 상태 확인
    const checkUser = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("사용자 확인 중 오류:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = authApi.onAuthStateChange((_, session) => {
      setUser((session as Session | null)?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authApi.signIn({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    await authApi.signUp({ email, password, confirmPassword: password });
  };

  const signOut = async () => {
    await authApi.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
