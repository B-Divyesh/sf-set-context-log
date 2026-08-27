export type LicenseState = 'locked' | 'checking' | 'unlocked' | 'invalid' | 'offline';

const SLUG = 'set-context-log';
const TOKEN_KEY = `sb_license:${SLUG}`;
const STATUS_KEY = `sb_license_status:${SLUG}`;
const DAY = 86_400_000;
const API_BASE = (import.meta.env.VITE_BILLING_API_BASE as string | undefined) || 'https://api.sociobot.in/api/v1';

interface CachedStatus { valid: boolean; checkedAt: number; }

function getCachedStatus(): CachedStatus | null {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) || 'null') as CachedStatus | null; }
  catch { return null; }
}

export function checkoutUrl(): string {
  return `${API_BASE}/products/${SLUG}/checkout`;
}

export function captureReturnedLicense(): boolean {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(STATUS_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function optimisticLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  const cached = getCachedStatus();
  return token && cached?.valid ? 'unlocked' : 'locked';
}

export async function verifySavedLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return 'locked';
  const cached = getCachedStatus();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid ? 'unlocked' : 'invalid';
  if (!navigator.onLine) return cached?.valid ? 'unlocked' : 'offline';
  try {
    const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(STATUS_KEY, JSON.stringify({ valid: Boolean(result.valid), checkedAt: Date.now() }));
    return result.valid ? 'unlocked' : 'invalid';
  } catch {
    return cached?.valid ? 'unlocked' : 'offline';
  }
}

export function saveLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(STATUS_KEY);
}
