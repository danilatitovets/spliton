"use client";

import * as React from "react";

import type {
  EmailSignInPayload,
  EmailSignUpPayload,
  PendingTwoFactorChallenge,
  SafeUser,
  TwoFactorVerifyPayload,
} from "@/types/auth";
import { clearAdminAccessVerified, rekeyAdminAccessVerified } from "@/features/admin/lib/admin-access-cache";
import { invalidateAdminDataCache } from "@/features/admin/lib/admin-data-cache";
import { invalidateClientCache } from "@/lib/client-data-cache";
import { invalidateWalletBalanceCache } from "@/lib/wallet-balance-cache";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  ApiError,
  logoutAllRequest,
  logoutRequest,
  meRequest,
  refreshSessionRequest,
  resendEmailVerification,
  signInWithEmail,
  signUpWithEmail,
  verifyEmail,
  verifyTwoFactor,
} from "@/services/auth.service";

type AuthContextValue = {
  user: SafeUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresEmailVerification: boolean;
  pendingTwoFactorChallenge: PendingTwoFactorChallenge | null;
  register: (payload: EmailSignUpPayload) => Promise<{ requiresEmailVerification: true }>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmail: (email: string) => Promise<void>;
  login: (payload: EmailSignInPayload) => Promise<"2fa_required" | string>;
  verify2fa: (payload: TwoFactorVerifyPayload) => Promise<string>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  loadMe: () => Promise<SafeUser | null>;
  authorizedFetch: (input: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

import { clearSessionHintCookie, hasClientSessionHint, setSessionHintCookie } from "@/lib/auth/session-cookie";
import {
  broadcastLogout,
  broadcastSession,
  coordinatedRefresh,
  subscribeAuthTabSync,
} from "@/lib/auth/auth-tab-sync";
import { resolveApiUrl } from "@/lib/public-env";

function resolveUrl(path: string): string {
  return resolveApiUrl(path);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [requiresEmailVerification, setRequiresEmailVerification] =
    React.useState(false);
  const [pendingTwoFactorChallenge, setPendingTwoFactorChallenge] =
    React.useState<PendingTwoFactorChallenge | null>(null);
  const accessTokenRef = React.useRef<string | null>(null);
  accessTokenRef.current = accessToken;
  /** Same-tab single-flight — BroadcastChannel does not deliver to the sender tab. */
  const refreshInFlightRef = React.useRef<Promise<string | null> | null>(null);
  const userIdRef = React.useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  const clearAuth = React.useCallback(() => {
    clearAdminAccessVerified();
    invalidateAdminDataCache();
    invalidateWalletBalanceCache();
    // Private portfolio/wallet/activity caches must not survive user switch.
    invalidateClientCache();
    clearSessionHintCookie();
    setUser(null);
    setAccessToken(null);
    setPendingTwoFactorChallenge(null);
  }, []);

  const loadMe = React.useCallback(async (): Promise<SafeUser | null> => {
    if (!accessToken) {
      setUser(null);
      return null;
    }
    try {
      const me = await meRequest(accessToken);
      setUser(me);
      return me;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuth();
      }
      return null;
    }
  }, [accessToken, clearAuth]);

  const refreshSession = React.useCallback(async (): Promise<string | null> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const run = (async (): Promise<string | null> => {
      let authRejected = false;

      const refreshed = await coordinatedRefresh(async () => {
        const runOnce = async () => {
          try {
            const previousToken = accessTokenRef.current;
            const response = await refreshSessionRequest();
            const nextToken = response.tokens.accessToken;
            rekeyAdminAccessVerified(previousToken, nextToken);
            setSessionHintCookie();
            return {
              user: response.user,
              accessToken: nextToken,
              ts: Date.now(),
            };
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              authRejected = true;
              return null;
            }
            // Network / timeout — keep existing session when we still have a token.
            return null;
          }
        };

        const first = await runOnce();
        if (first || authRejected) return first;
        await new Promise((r) => window.setTimeout(r, 350));
        return runOnce();
      });

      if (!refreshed) {
        if (authRejected) {
          clearAuth();
          return null;
        }
        // Transient miss (lock wait / network): do not kick a live session.
        return accessTokenRef.current;
      }

      setAccessToken(refreshed.accessToken);
      setUser(refreshed.user);
      return refreshed.accessToken;
    })();

    refreshInFlightRef.current = run;
    try {
      return await run;
    } finally {
      if (refreshInFlightRef.current === run) {
        refreshInFlightRef.current = null;
      }
    }
  }, [clearAuth]);

  const register = React.useCallback(
    async (payload: EmailSignUpPayload): Promise<{ requiresEmailVerification: true }> => {
      const response = await signUpWithEmail(payload);
      setRequiresEmailVerification(response.requiresEmailVerification);
      return response;
    },
    [],
  );

  const handleAuthSuccess = React.useCallback((nextUser: SafeUser, token: string) => {
    // Switching accounts in the same browser tab must not show previous user's portfolio.
    if (userIdRef.current && userIdRef.current !== nextUser.id) {
      invalidateClientCache();
      invalidateWalletBalanceCache();
      invalidateAdminDataCache();
    }
    setAccessToken(token);
    setUser(nextUser);
    setPendingTwoFactorChallenge(null);
    setRequiresEmailVerification(false);
    setSessionHintCookie();
    broadcastSession({ user: nextUser, accessToken: token, ts: Date.now() });
  }, []);

  const login = React.useCallback(
    async (
      payload: EmailSignInPayload,
    ): Promise<"2fa_required" | string> => {
      const result = await signInWithEmail(payload);
      if ("requires2fa" in result) {
        setPendingTwoFactorChallenge({
          challengeId: result.challengeId,
          availableMethods: result.availableMethods,
          email: payload.email,
        });
        return "2fa_required";
      }
      handleAuthSuccess(result.user, result.tokens.accessToken);
      return result.tokens.accessToken;
    },
    [handleAuthSuccess],
  );

  const verify2fa = React.useCallback(
    async (payload: TwoFactorVerifyPayload): Promise<string> => {
      const result = await verifyTwoFactor(payload);
      handleAuthSuccess(result.user, result.tokens.accessToken);
      return result.tokens.accessToken;
    },
    [handleAuthSuccess],
  );

  const handleVerifyEmail = React.useCallback(async (token: string): Promise<void> => {
    await verifyEmail(token);
    setRequiresEmailVerification(false);
  }, []);

  const resendEmail = React.useCallback(async (email: string): Promise<void> => {
    await resendEmailVerification(email);
  }, []);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
      broadcastLogout();
    }
  }, [clearAuth]);

  const logoutAll = React.useCallback(async (): Promise<void> => {
    try {
      if (accessToken) {
        await logoutAllRequest(accessToken);
      } else {
        await logoutRequest();
      }
    } finally {
      clearAuth();
      broadcastLogout();
    }
  }, [accessToken, clearAuth]);

  const refreshSessionRef = React.useRef(refreshSession);
  refreshSessionRef.current = refreshSession;

  // Stable identity — favorites/watchlist must not re-hydrate on every token refresh.
  const authorizedFetch = React.useCallback(
    async (input: string, init?: RequestInit): Promise<Response> => {
      const target = input.startsWith("http") ? input : resolveUrl(input);
      const doRequest = (token: string | null) =>
        fetchWithTimeout(target, {
          credentials: "include",
          ...init,
          headers: {
            ...(init?.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let response = await doRequest(accessTokenRef.current);
      if (response.status !== 401) {
        return response;
      }

      const refreshedToken = await refreshSessionRef.current();
      if (!refreshedToken) {
        return response;
      }

      return doRequest(refreshedToken);
    },
    [],
  );

  React.useEffect(() => {
    return subscribeAuthTabSync({
      onSession: (payload) => {
        if (userIdRef.current && userIdRef.current !== payload.user.id) {
          invalidateClientCache();
          invalidateWalletBalanceCache();
          invalidateAdminDataCache();
        }
        setAccessToken(payload.accessToken);
        setUser(payload.user);
        setPendingTwoFactorChallenge(null);
        setRequiresEmailVerification(false);
        setSessionHintCookie();
        setIsLoading(false);
      },
      onLogout: () => {
        clearAuth();
        setIsLoading(false);
      },
    });
  }, [clearAuth]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      // Guests: skip refresh round-trip (avoids 401 → clearAuth flicker on login).
      if (!hasClientSessionHint()) {
        if (active) setIsLoading(false);
        return;
      }
      await refreshSession();
      if (active) setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      requiresEmailVerification,
      pendingTwoFactorChallenge,
      register,
      verifyEmail: handleVerifyEmail,
      resendEmail,
      login,
      verify2fa,
      refreshSession,
      logout,
      logoutAll,
      loadMe,
      authorizedFetch,
    }),
    [
      user,
      accessToken,
      isLoading,
      requiresEmailVerification,
      pendingTwoFactorChallenge,
      register,
      handleVerifyEmail,
      resendEmail,
      login,
      verify2fa,
      refreshSession,
      logout,
      logoutAll,
      loadMe,
      authorizedFetch,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
