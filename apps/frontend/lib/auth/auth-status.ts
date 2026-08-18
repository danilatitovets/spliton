export type AuthStatus =
  | "initializing"
  | "authenticated"
  | "anonymous"
  | "refreshing"
  | "error";

export type AuthUiSlice = {
  status?: AuthStatus;
  isLoading?: boolean;
  isAuthenticated: boolean;
};

export type AuthUiState = {
  status: AuthStatus;
  pending: boolean;
  authenticated: boolean;
  anonymous: boolean;
  errored: boolean;
};

/**
 * `user === null` is not a guest. Until bootstrap finishes, chrome must stay
 * in a pending/skeleton state — never login CTA, fallback name, or zero scores.
 */
export function resolveAuthStatus(auth: AuthUiSlice): AuthStatus {
  if (auth.status) return auth.status;
  if (auth.isLoading) return "initializing";
  return auth.isAuthenticated ? "authenticated" : "anonymous";
}

export function resolveAuthUiState(auth: AuthUiSlice): AuthUiState {
  const status = resolveAuthStatus(auth);
  return {
    status,
    pending: status === "initializing" || status === "refreshing",
    authenticated: status === "authenticated",
    anonymous: status === "anonymous",
    errored: status === "error",
  };
}

export function deriveAuthStatus(input: {
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionError: boolean;
  hasAccessToken: boolean;
}): AuthStatus {
  if (input.isLoading) {
    return input.hasAccessToken ? "refreshing" : "initializing";
  }
  if (input.sessionError && !input.isAuthenticated) return "error";
  if (input.isAuthenticated) return "authenticated";
  return "anonymous";
}
