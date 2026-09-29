import { supabase } from "../../../services/supabase/client";
import { profileService } from "./profile.service";
import {
  clearDemoSession,
  findDemoAccount,
  isNetworkAuthError,
  saveDemoSession,
} from "./demo-auth";

export const authService = {
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:
            email.toLowerCase() === "hr@reude.tech" ? "HR User" : "User",
          role: email.toLowerCase() === "hr@reude.tech" ? "HR" : "EMPLOYEE",
        },
      },
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Prefer Supabase auth. If the backend is unreachable, fall back to
   * local demo accounts so the app remains usable offline.
   */
  async signInOrCreate(email: string, password: string) {
    clearDemoSession();

    const demo = findDemoAccount(email, password);
    if (demo) {
      return this.signInDemo(email, password);
    }

    try {
      const first = await this.signIn(email, password);
      if (!first.error) {
        await this.ensureSessionProfile();
        return first;
      }

      if (isNetworkAuthError(first.error)) {
        return this.signInDemo(email, password, first.error);
      }

      const msg = (first.error.message || "").toLowerCase();
      const canCreate =
        msg.includes("invalid login") ||
        msg.includes("invalid credentials") ||
        msg.includes("user not found");

      if (!canCreate) return first;

      const created = await this.signUp(email, password);
      if (created.error) {
        if (isNetworkAuthError(created.error)) {
          return this.signInDemo(email, password, created.error);
        }
        return first;
      }

      const second = await this.signIn(email, password);
      if (!second.error) {
        await this.ensureSessionProfile();
        return second;
      }

      if (isNetworkAuthError(second.error)) {
        return this.signInDemo(email, password, second.error);
      }

      return second.error ? created : second;
    } catch (error) {
      if (isNetworkAuthError(error)) {
        return this.signInDemo(email, password, error);
      }
      return {
        data: { user: null, session: null },
        error: error as any,
      };
    }
  },

  signInDemo(email: string, password: string, originalError?: unknown) {
    const account = findDemoAccount(email, password);
    if (!account) {
      return {
        data: { user: null, session: null },
        error: {
          message:
            originalError && isNetworkAuthError(originalError)
              ? "Cannot reach Supabase, and these credentials are not a local demo account."
              : ((originalError as any)?.message as string) ||
                "Invalid login credentials",
        },
      };
    }

    const session = saveDemoSession(account);
    return {
      data: { user: session.user, session: { user: session.user } },
      error: null,
    };
  },

  async ensureSessionProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    return profileService.getCurrentProfile(user.id);
  },

  async signOut() {
    clearDemoSession();
    try {
      return await supabase.auth.signOut();
    } catch {
      return { error: null } as any;
    }
  },

  async getUser() {
    return await supabase.auth.getUser();
  },
};
