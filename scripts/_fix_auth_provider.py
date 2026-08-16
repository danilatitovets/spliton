from pathlib import Path
p = Path("apps/frontend/components/providers/auth-provider.tsx")
text = p.read_text(encoding="utf-8")

old = '''  const authorizedFetch = React.useCallback(
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

      let response = await doRequest(accessToken);
      if (response.status !== 401) {
        return response;
      }

      const refreshedToken = await refreshSession();
      if (!refreshedToken) {
        return response;
      }

      response = await doRequest(refreshedToken);
      if (response.status === 401) {
        clearAuth();
      }
      return response;
    },
    [accessToken, refreshSession, clearAuth],
  );'''

new = '''  const refreshSessionRef = React.useRef(refreshSession);
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
  );'''

if old not in text:
    raise SystemExit("authorizedFetch block not found")
p.write_text(text.replace(old, new), encoding="utf-8")
print("auth-provider ok")