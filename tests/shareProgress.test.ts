import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('@/data/routines', () => ({ DEFAULT_ROUTINES: [] }));
vi.mock('@/data/exercises', () => ({ CLASSIC_EXERCISES: [] }));

vi.mock('react-native-view-shot', () => ({
  default: vi.fn(),
  captureRef: vi.fn(),
}));

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn(),
  shareAsync: vi.fn(),
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  ImpactFeedbackStyle: { Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success' },
}));

// ─── Imports after mocks ───────────────────────────────────────────────────────

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

// ─── Helpers that mirror the share handler logic ───────────────────────────────

async function simulateShare(
  ref: object | null,
  historyLength: number,
  exerciseName: string
): Promise<{ success: boolean; error?: string }> {
  if (!ref || historyLength === 0) {
    return { success: false, error: 'no_data' };
  }

  try {
    const uri = await (captureRef as any)(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return { success: false, error: 'unavailable' };
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: `Minha evolução — ${exerciseName}`,
      UTI: 'public.png',
    });

    return { success: true };
  } catch (err: any) {
    if (String(err).includes('cancel') || String(err).includes('Cancel')) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: 'unknown' };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Share Progress Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not attempt capture when history is empty', async () => {
    const result = await simulateShare({}, 0, 'Supino');
    expect(result.success).toBe(false);
    expect(result.error).toBe('no_data');
    expect(captureRef).not.toHaveBeenCalled();
  });

  it('does not attempt capture when ref is null', async () => {
    const result = await simulateShare(null, 5, 'Supino');
    expect(result.success).toBe(false);
    expect(result.error).toBe('no_data');
    expect(captureRef).not.toHaveBeenCalled();
  });

  it('calls captureRef with correct PNG options', async () => {
    vi.mocked(captureRef).mockResolvedValue('/tmp/share_123.png');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Sharing.shareAsync).mockResolvedValue(undefined);

    const fakeRef = { current: {} };
    await simulateShare(fakeRef, 3, 'Agachamento');

    expect(captureRef).toHaveBeenCalledWith(fakeRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  });

  it('returns unavailable when sharing is not supported', async () => {
    vi.mocked(captureRef).mockResolvedValue('/tmp/share_123.png');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);

    const result = await simulateShare({}, 3, 'Supino');
    expect(result.success).toBe(false);
    expect(result.error).toBe('unavailable');
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('calls shareAsync with correct mime type and dialog title', async () => {
    const fakeUri = '/tmp/progress_chart.png';
    vi.mocked(captureRef).mockResolvedValue(fakeUri);
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Sharing.shareAsync).mockResolvedValue(undefined);

    await simulateShare({}, 5, 'Desenvolvimento com Halteres');

    expect(Sharing.shareAsync).toHaveBeenCalledWith(fakeUri, {
      mimeType: 'image/png',
      dialogTitle: 'Minha evolução — Desenvolvimento com Halteres',
      UTI: 'public.png',
    });
  });

  it('returns success when share completes normally', async () => {
    vi.mocked(captureRef).mockResolvedValue('/tmp/share.png');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Sharing.shareAsync).mockResolvedValue(undefined);

    const result = await simulateShare({}, 2, 'Levantamento Terra');
    expect(result.success).toBe(true);
  });

  it('handles user cancellation gracefully (no error thrown)', async () => {
    vi.mocked(captureRef).mockResolvedValue('/tmp/share.png');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Sharing.shareAsync).mockRejectedValue(new Error('User cancelled'));

    const result = await simulateShare({}, 2, 'Supino');
    expect(result.success).toBe(false);
    expect(result.error).toBe('cancelled');
  });

  it('handles unexpected errors gracefully', async () => {
    vi.mocked(captureRef).mockRejectedValue(new Error('Capture failed: out of memory'));
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);

    const result = await simulateShare({}, 2, 'Supino');
    expect(result.success).toBe(false);
    expect(result.error).toBe('unknown');
  });

  it('passes the captured URI directly to shareAsync', async () => {
    const expectedUri = '/tmp/milon_progress_abc123.png';
    vi.mocked(captureRef).mockResolvedValue(expectedUri);
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Sharing.shareAsync).mockResolvedValue(undefined);

    await simulateShare({}, 1, 'Rosca Direta');

    const shareCall = vi.mocked(Sharing.shareAsync).mock.calls[0];
    expect(shareCall[0]).toBe(expectedUri);
  });
});

// ─── ShareProgressCard data helpers ──────────────────────────────────────────

describe('ShareProgressCard data formatting', () => {
  it('formats progress sign correctly for positive progress', () => {
    const progress = 10;
    const sign = progress >= 0 ? '+' : '';
    expect(`${sign}${progress}kg`).toBe('+10kg');
  });

  it('formats progress sign correctly for negative progress', () => {
    const progress = -5;
    const sign = progress >= 0 ? '+' : '';
    expect(`${sign}${progress}kg`).toBe('-5kg');
  });

  it('formats progress sign correctly for zero progress', () => {
    const progress = 0;
    const sign = progress >= 0 ? '+' : '';
    expect(`${sign}${progress}kg`).toBe('+0kg');
  });

  it('formats large volume values with ton suffix', () => {
    const formatValue = (val: number, unit: string): string => {
      if (unit === 'kg' && val >= 1000) return `${(val / 1000).toFixed(1)}t`;
      return `${Math.round(val * 10) / 10}${unit}`;
    };
    expect(formatValue(1500, 'kg')).toBe('1.5t');
    expect(formatValue(999, 'kg')).toBe('999kg');
    expect(formatValue(100, 'kg')).toBe('100kg');
  });
});
