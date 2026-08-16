from pathlib import Path

# --- auth-tab-sync: fix lock-release treating as failure ---
p = Path("apps/frontend/lib/auth/auth-tab-sync.ts")
text = p.read_text(encoding="utf-8")
old = '''    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCK_KEY || event.newValue !== null) return;
      cleanup();
      resolve(null);
    };'''
new = '''    const onStorage = (event: StorageEvent) => {
      // Lock released by another tab — wait for SESSION broadcast, do not
      // treat this as refresh failure (that was logging users out briefly).
      if (event.key !== LOCK_KEY || event.newValue !== null) return;
    };'''
if old not in text:
    raise SystemExit("auth-tab-sync pattern not found")
p.write_text(text.replace(old, new), encoding="utf-8")
print("auth-tab-sync ok")

# --- coordinatedRefresh: never give up without trying refreshFn ---
text = p.read_text(encoding="utf-8")
old2 = '''  if (!lockId) {
    const synced = await waitForSessionSync(waitStartedAt);
    if (synced) return synced;

    lockId = tryAcquireRefreshLock();
    if (!lockId) {
      return null;
    }
  }'''
new2 = '''  if (!lockId) {
    const synced = await waitForSessionSync(waitStartedAt);
    if (synced) return synced;

    lockId = tryAcquireRefreshLock();
    if (!lockId) {
      // Avoid hard-fail (clearAuth): refresh in this tab without exclusive lock.
      return refreshFn();
    }
  }'''
if old2 not in text:
    raise SystemExit("coordinatedRefresh pattern not found")
p.write_text(text.replace(old2, new2), encoding="utf-8")
print("coordinatedRefresh ok")