"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { resolveAuthUiState, type AuthUiState } from "@/lib/auth/auth-status";

export function useAuthUi(): ReturnType<typeof useAuth> & AuthUiState {
  const auth = useAuth();
  return { ...auth, ...resolveAuthUiState(auth) };
}
