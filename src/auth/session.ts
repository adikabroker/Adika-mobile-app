import { authenticateDevice, getStoredUser, clearSession } from '../api/client';
import type { AuthUser } from '../types/listing';

export async function ensureDeviceSession(displayName?: string): Promise<AuthUser | null> {
  const existing = await getStoredUser();
  if (existing?.user_id || existing?.id) return existing;

  const res = await authenticateDevice(displayName || 'Adika User');
  return res.user || null;
}

export async function logout(): Promise<void> {
  await clearSession();
}
