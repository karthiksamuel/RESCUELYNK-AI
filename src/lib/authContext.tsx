import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "citizen" | "rescue_team" | "command_operator";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  demoMode: boolean;
  userName: string;
  userRole: AppRole | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, displayName: string, role?: AppRole) => Promise<{ error?: string }>;
  startDemo: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  loginWithCode: (code: string, role: "rescue_team" | "command_operator") => Promise<{ error?: string }>;
  loginOfflineCitizen: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase.rpc("get_user_role", { _user_id: userId });
  if (error || !data) return null;
  return data as AppRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    demoMode: localStorage.getItem("rescuelink_demoMode") === "true",
    userName: localStorage.getItem("rescuelink_userName") || "",
    userRole: (localStorage.getItem("rescuelink_userRole") as AppRole) || null,
    loading: true,
  });

  const loadRole = useCallback(async (user: User) => {
    const role = await fetchUserRole(user.id);
    setState(prev => ({ ...prev, userRole: role }));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState(prev => ({
        ...prev,
        user,
        isLoggedIn: !!user,
        demoMode: user ? false : prev.demoMode,
        userName: user?.user_metadata?.display_name || user?.email || prev.userName,
        loading: false,
      }));
      if (user) {
        localStorage.removeItem("rescuelink_demoMode");
        // Fetch role without blocking auth state
        fetchUserRole(user.id).then(role => {
          setState(prev => ({ ...prev, userRole: role }));
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setState(prev => ({
        ...prev,
        user,
        isLoggedIn: !!user,
        userName: user?.user_metadata?.display_name || user?.email || prev.userName,
        loading: false,
      }));
      if (user) {
        fetchUserRole(user.id).then(role => {
          setState(prev => ({ ...prev, userRole: role }));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string, role: AppRole = "citizen") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const startDemo = useCallback(() => {
    localStorage.setItem("rescuelink_demoMode", "true");
    localStorage.setItem("rescuelink_userName", "Demo Operator");
    localStorage.setItem("rescuelink_userRole", "command_operator");
    setState(prev => ({
      ...prev,
      demoMode: true,
      userName: "Demo Operator",
      userRole: "command_operator",
      loading: false,
    }));
  }, []);

  const loginWithCode = useCallback(async (code: string, role: "rescue_team" | "command_operator") => {
    const validCodes = {
      rescue_team: import.meta.env.VITE_RESCUE_ACCESS_CODE || "RL-RESCUE-7777",
      command_operator: import.meta.env.VITE_COMMANDER_ACCESS_CODE || "RL-COMMAND-9090",
    };

    if (code !== validCodes[role]) {
      return { error: "Invalid access code" };
    }

    localStorage.setItem("rescuelink_demoMode", "true");
    localStorage.setItem("rescuelink_userName", role === "rescue_team" ? "Rescue Medic" : "Commander");
    localStorage.setItem("rescuelink_userRole", role);
    setState(prev => ({
      ...prev,
      demoMode: true,
      userName: role === "rescue_team" ? "Rescue Medic" : "Commander",
      userRole: role,
      loading: false,
    }));
    return {};
  }, []);

  const loginOfflineCitizen = useCallback(async (email: string) => {
    localStorage.setItem("rescuelink_demoMode", "true");
    localStorage.setItem("rescuelink_userName", email.split('@')[0] || "Citizen");
    localStorage.setItem("rescuelink_userRole", "citizen");
    setState(prev => ({
      ...prev,
      demoMode: true,
      userName: email.split('@')[0] || "Citizen",
      userRole: "citizen",
      loading: false,
    }));
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("rescuelink_demoMode");
    localStorage.removeItem("rescuelink_userName");
    localStorage.removeItem("rescuelink_userRole");
    setState({
      user: null,
      isLoggedIn: false,
      demoMode: false,
      userName: "",
      userRole: null,
      loading: false,
    });
  }, []);

  const isAuthenticated = state.isLoggedIn || state.demoMode;

  const hasRole = useCallback((role: AppRole) => {
    if (state.demoMode) return true; // Demo has full access
    return state.userRole === role;
  }, [state.demoMode, state.userRole]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, startDemo, logout, isAuthenticated, hasRole, loginWithCode, loginOfflineCitizen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
