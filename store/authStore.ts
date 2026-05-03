/**
 * authStore.ts
 *
 * Sistema de autenticação local simples com AsyncStorage.
 * Usuários são armazenados localmente com senha hasheada (SHA-256 simplificado via djb2).
 * Não requer servidor — funciona 100% offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@milon:auth_session';
const USERS_KEY = '@milon:users';

export interface UserProfile {
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthSession {
  username: string;
  displayName: string;
  loggedInAt: string;
}

// Simple deterministic hash (djb2) — good enough for local-only auth
function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) ^ password.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}

// ─── Seed the default user on first run ──────────────────────────────────────

const DEFAULT_USERS: UserProfile[] = [
  {
    username: 'marcuscattem',
    displayName: 'Marcus Cattem',
    passwordHash: hashPassword('12011994'),
    createdAt: new Date().toISOString(),
  },
];

async function ensureDefaultUsers(): Promise<void> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

async function getUsers(): Promise<UserProfile[]> {
  await ensureDefaultUsers();
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return DEFAULT_USERS;
  try {
    return JSON.parse(raw) as UserProfile[];
  } catch {
    return DEFAULT_USERS;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  const users = await getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim()
  );

  if (!user) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  const inputHash = hashPassword(password);
  if (inputHash !== user.passwordHash) {
    return { success: false, error: 'Senha incorreta.' };
  }

  const session: AuthSession = {
    username: user.username,
    displayName: user.displayName,
    loggedInAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true, session };
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function registerUser(
  username: string,
  displayName: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  const users = await getUsers();
  const exists = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim()
  );
  if (exists) {
    return { success: false, error: 'Nome de usuário já existe.' };
  }

  const newUser: UserProfile = {
    username: username.trim(),
    displayName: displayName.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}
