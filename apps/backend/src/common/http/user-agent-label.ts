/** Human-readable browser/OS label from a User-Agent string. */
export function formatDeviceFromUserAgent(
  userAgent: string | null | undefined,
  fallback = 'Browser',
): string {
  const ua = userAgent?.trim();
  if (!ua) return fallback;

  let browser = fallback;
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  let os = '';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return os ? `${browser} / ${os}` : browser;
}

export function looksLikeRawUserAgent(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /mozilla\/|applewebkit|chrome\/|safari\/|gecko\//i.test(value) || value.length > 64;
}

export function resolveSessionDeviceLabel(
  device: string | null | undefined,
  userAgent: string | null | undefined,
  fallback = 'Browser',
): string {
  const raw = device?.trim();
  if (raw && !looksLikeRawUserAgent(raw)) return raw;
  return formatDeviceFromUserAgent(userAgent || raw, fallback);
}
