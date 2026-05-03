/**
 * marcusAuth.test.ts
 *
 * Testes para o sistema de autenticação local e lógica de alternância de exercícios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock AsyncStorage ────────────────────────────────────────────────────────

const store: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => store[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn(async (key: string) => { delete store[key]; }),
  },
}));

// ─── Auth Store Tests ─────────────────────────────────────────────────────────

describe('authStore', () => {
  beforeEach(() => {
    // Clear store before each test
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it('should login with correct credentials (marcuscattem / 12011994)', async () => {
    const { login } = await import('../store/authStore');
    const result = await login('marcuscattem', '12011994');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.username).toBe('marcuscattem');
      expect(result.session.displayName).toBe('Marcus Cattem');
    }
  });

  it('should reject wrong password', async () => {
    const { login } = await import('../store/authStore');
    const result = await login('marcuscattem', 'wrongpassword');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Senha incorreta');
    }
  });

  it('should reject unknown username', async () => {
    const { login } = await import('../store/authStore');
    const result = await login('unknownuser', '12011994');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('não encontrado');
    }
  });

  it('should persist session after login', async () => {
    const { login, getSession } = await import('../store/authStore');
    await login('marcuscattem', '12011994');
    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.username).toBe('marcuscattem');
  });

  it('should clear session after logout', async () => {
    const { login, logout, getSession } = await import('../store/authStore');
    await login('marcuscattem', '12011994');
    await logout();
    const session = await getSession();
    expect(session).toBeNull();
  });

  it('should be case-insensitive for username', async () => {
    const { login } = await import('../store/authStore');
    const result = await login('MARCUSCATTEM', '12011994');
    expect(result.success).toBe(true);
  });
});

// ─── Marcus Routines Tests ────────────────────────────────────────────────────

describe('MARCUS_ROUTINES', () => {
  it('should have 9 routines (A-G + Pliometria + Argolas)', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    expect(MARCUS_ROUTINES).toHaveLength(9);
  });

  it('each routine should have exercises', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    MARCUS_ROUTINES.forEach((r) => {
      expect(r.exercises.length).toBeGreaterThan(0);
    });
  });

  it('all alternatives should reference valid main exercise indices', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    MARCUS_ROUTINES.forEach((routine) => {
      const mainExercises = routine.exercises.filter((e) => !e.isAlternative);
      routine.exercises
        .filter((e) => e.isAlternative)
        .forEach((alt) => {
          expect(alt.alternativeFor).toBeDefined();
          expect(alt.alternativeFor!).toBeGreaterThanOrEqual(0);
          expect(alt.alternativeFor!).toBeLessThan(routine.exercises.length);
        });
    });
  });

  it('Treino A should have Levantamento terra as first exercise', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A');
    expect(treinoA).toBeDefined();
    const firstMain = treinoA!.exercises.find((e) => !e.isAlternative);
    expect(firstMain?.name).toBe('Levantamento terra');
  });

  it('Treino A should have Cluster-Set technique on first exercise', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A');
    const first = treinoA!.exercises.find((e) => !e.isAlternative);
    expect(first?.technique).toBe('Cluster-Set');
  });

  it('should have bi-set groups in Treino A', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A');
    const bisetExercises = treinoA!.exercises.filter((e) => e.bisetGroup !== undefined);
    expect(bisetExercises.length).toBeGreaterThan(0);
  });

  it('Pliometria routine should exist', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const plio = MARCUS_ROUTINES.find((r) => r.id === 'marcus_plio');
    expect(plio).toBeDefined();
    expect(plio?.name).toBe('Pliometria');
  });

  it('Argolas routine should exist', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const argolas = MARCUS_ROUTINES.find((r) => r.id === 'marcus_argolas');
    expect(argolas).toBeDefined();
    expect(argolas?.name).toBe('Argolas');
  });
});

// ─── Alternative toggle logic ─────────────────────────────────────────────────

describe('Alternative exercise toggle logic', () => {
  it('should correctly identify exercises with alternatives', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A')!;

    const hasAlternative = (idx: number) =>
      treinoA.exercises.some((e) => e.isAlternative && e.alternativeFor === idx);

    // Levantamento terra (index 0) has cadeira flexora as alternative
    expect(hasAlternative(0)).toBe(true);
    // Mesa flexora (index 2) has no alternative
    expect(hasAlternative(2)).toBe(false);
  });

  it('should build display list correctly with no alternatives toggled', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A')!;
    const showingAlternative: Record<number, boolean> = {};

    const displayList = treinoA.exercises
      .map((ex, idx) => ({ ...ex, originalIndex: idx }))
      .filter((ex) => {
        if (ex.isAlternative) return false;
        return true;
      });

    // Should show only main exercises
    expect(displayList.every((e) => !e.isAlternative)).toBe(true);
    // Treino A has 7 main exercises (levterra, mesaflex, remserrote, supbarra, scottplate, roscaalt, triccoice)
    expect(displayList.length).toBe(7);
  });

  it('should swap exercise when alternative is toggled', async () => {
    const { MARCUS_ROUTINES } = await import('../data/marcus_routines');
    const treinoA = MARCUS_ROUTINES.find((r) => r.id === 'marcus_A')!;
    const showingAlternative: Record<number, boolean> = { 0: true };

    const buildDisplayList = () => {
      const result: typeof treinoA.exercises = [];
      treinoA.exercises.forEach((ex, idx) => {
        if (ex.isAlternative) return;
        const isShowingAlt = showingAlternative[idx];
        if (isShowingAlt) {
          const alt = treinoA.exercises.find(
            (e) => e.isAlternative && e.alternativeFor === idx
          );
          if (alt) { result.push(alt); return; }
        }
        result.push(ex);
      });
      return result;
    };

    const list = buildDisplayList();
    // First exercise should now be the alternative (cadeira flexora)
    expect(list[0].name).toBe('Cadeira flexora com tronco à frente');
    expect(list[0].isAlternative).toBe(true);
  });
});
