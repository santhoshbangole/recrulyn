import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../services/supabase/client";
import { profileService } from "../../modules/auth/services/profile.service";
import {
  clearDemoSession,
  readDemoSession,
} from "../../modules/auth/services/demo-auth";
import { seedDemoWorkspace } from "../../modules/demo/seed";

interface AuthContextType {
  user: any;
  profile: any;
  role: string;
  permissions: string[];
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "",
  permissions: [],
  loading: true,
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const role = profile?.role_name?.toUpperCase() || "";

  useEffect(() => {
    async function loadProfile(authUser: any, demoProfile?: any) {
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(authUser);

      if (demoProfile || authUser.is_demo) {
        setProfile(
          demoProfile || {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || "User",
            role_name:
              authUser.app_metadata?.role ||
              authUser.user_metadata?.role ||
              "EMPLOYEE",
          }
        );
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await profileService.getCurrentProfile(
          authUser.id
        );
        setProfile(nextProfile);
      } catch (e) {
        console.error("Failed to load profile", e);
        setProfile({
          email: authUser.email,
          role_name:
            authUser.email?.toLowerCase() === "hr@reude.tech"
              ? "HR"
              : "EMPLOYEE",
          full_name: authUser.user_metadata?.full_name || "User",
        });
      }
      setLoading(false);
    }

    async function initialize() {
      const demo = readDemoSession();
      if (demo?.user) {
        seedDemoWorkspace();
        await loadProfile(demo.user, demo.profile);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await loadProfile(session?.user ?? null);
      } catch (e) {
        console.error("Auth init failed", e);
        await loadProfile(null);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (readDemoSession()?.user) return;
      await loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    clearDemoSession();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore offline sign-out errors
    }

    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        permissions: [],
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
