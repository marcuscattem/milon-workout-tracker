/**
 * app/marcus/workout/[id].tsx
 *
 * Tela de treino ativo do Marcus Cattem — v1.4
 * Funcionalidades:
 * - Navega exercício a exercício
 * - Botão 🔄 para alternar entre exercício principal e alternativo
 * - Registro de peso e reps por série com teclado numérico
 * - Exibe dados do treino anterior por série (peso e reps)
 * - Timer de descanso automático (90s) ao completar série
 * - Badge de técnica com descrição
 * - Salva treino no workoutStore ao finalizar (integrado com gráficos e PRs)
 * - Tela de resumo com PRs detectados
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MARCUS_ROUTINES, ExerciseSlot } from '@/data/marcus_routines';
import {
  saveMarcusWorkout,
  getPreviousPerformanceForExercise,
  PreviousExercisePerformance,
  calculate1RM,
} from '@/store/workoutStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const TECHNIQUE_COLORS: Record<string, string> = {
  'Cluster-Set': '#F59E0B',
  'Isometria': '#3B82F6',
  'Rest-Pause': '#EF4444',
  'Repetições parciais': '#EF4444',
  'Tradicional': '#6B7280',
  'Bi-Set': '#8B5CF6',
  'Circuito': '#10B981',
};

const TECHNIQUE_DESCRIPTIONS: Record<string, string> = {
  'Cluster-Set': 'Metade das reps → descanso 20s → restante. Carga acima do máximo. Todas as séries.',
  'Isometria': 'Isometria de 20s ao final da série em 50% da amplitude. 2 últimas séries.',
  'Rest-Pause': 'Até a falha → 10s → até a falha → 10s → até a falha. 2 últimas séries.',
  'Repetições parciais': 'Após a falha, reps adicionais com amplitude parcial (metade). 2 últimas séries.',
  'Tradicional': 'Concêntrica rápida + excêntrica lenta. Pausa 60-120s.',
  'Bi-Set': 'Dois exercícios em sequência sem intervalo.',
  'Circuito': 'Todos os exercícios em sequência sem pausa.',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SetData {
  weight: string;
  reps: string;
  done: boolean;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MarcusWorkoutScreen() {
  useKeepAwake();
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const routine = MARCUS_ROUTINES.find((r) => r.id === id);

  // ── State ──────────────────────────────────────────────────────────────────
  const [showingAlternative, setShowingAlternative] = useState<Record<number, boolean>>({});
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [setsData, setSetsData] = useState<Record<string, SetData[]>>({});
  const [prevPerf, setPrevPerf] = useState<Record<string, PreviousExercisePerformance | null>>({});

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Workout duration
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Summary screen
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalSets: number;
    totalVolume: number;
    duration: number;
    prs: { name: string; weight: number; reps: number; est1RM: number }[];
  } | null>(null);

  // ── Timers ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, []);

  useEffect(() => {
    if (isResting && restSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRestSeconds((s) => {
          if (s <= 1) {
            setIsResting(false);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting, restSeconds]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!routine) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Treino não encontrado.</Text>
      </ScreenContainer>
    );
  }

  // ── Display list ───────────────────────────────────────────────────────────
  const buildDisplayList = (): (ExerciseSlot & { originalIndex: number })[] => {
    const result: (ExerciseSlot & { originalIndex: number })[] = [];
    routine.exercises.forEach((ex, idx) => {
      if (ex.isAlternative) return;
      const isShowingAlt = showingAlternative[idx];
      if (isShowingAlt) {
        const alt = routine.exercises.find((e) => e.isAlternative && e.alternativeFor === idx);
        if (alt) { result.push({ ...alt, originalIndex: idx }); return; }
      }
      result.push({ ...ex, originalIndex: idx });
    });
    return result;
  };

  const displayList = buildDisplayList();
  const currentEx = displayList[currentExIndex];
  const isLastEx = currentExIndex === displayList.length - 1;
  const canToggle = currentEx ? hasAlternative(currentEx.originalIndex) : false;
  const isShowingAlt = currentEx ? !!showingAlternative[currentEx.originalIndex] : false;

  // ── Load previous performance for current exercise ─────────────────────────
  useEffect(() => {
    if (!currentEx) return;
    if (prevPerf[currentEx.id] !== undefined) return; // already loaded
    getPreviousPerformanceForExercise(currentEx.id).then((perf) => {
      setPrevPerf((prev) => ({ ...prev, [currentEx.id]: perf }));
    });
  }, [currentEx?.id]);

  // ── Set helpers ────────────────────────────────────────────────────────────
  const getExSets = (ex: ExerciseSlot): SetData[] => {
    if (setsData[ex.id]) return setsData[ex.id];
    return Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false }));
  };

  const updateSet = (exId: string, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setSetsData((prev) => {
      const current = prev[exId] ?? getExSets(currentEx);
      const updated = current.map((s, i) => i === setIdx ? { ...s, [field]: value } : s);
      return { ...prev, [exId]: updated };
    });
  };

  const markSetDone = (exId: string, setIdx: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSetsData((prev) => {
      const current = prev[exId] ?? getExSets(currentEx);
      const updated = current.map((s, i) => i === setIdx ? { ...s, done: true } : s);
      return { ...prev, [exId]: updated };
    });
    setRestSeconds(90);
    setIsResting(true);
  };

  function hasAlternative(originalIndex: number): boolean {
    return routine?.exercises.some((e) => e.isAlternative && e.alternativeFor === originalIndex) ?? false;
  }

  const toggleAlternative = (originalIndex: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowingAlternative((prev) => ({ ...prev, [originalIndex]: !prev[originalIndex] }));
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentExIndex < displayList.length - 1) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentExIndex((i) => i + 1);
    } else {
      confirmFinish();
    }
  };

  const goPrev = () => {
    if (currentExIndex > 0) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentExIndex((i) => i - 1);
    }
  };

  // ── Finish ─────────────────────────────────────────────────────────────────
  const confirmFinish = () => {
    Alert.alert(
      'Finalizar Treino',
      'Deseja salvar e encerrar o treino?',
      [
        { text: 'Continuar', style: 'cancel' },
        { text: 'Finalizar', style: 'default', onPress: doFinish },
      ]
    );
  };

  const doFinish = async () => {
    if (!routine) return;
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalDuration = elapsed;

    // Save workout
    const savedWorkout = await saveMarcusWorkout({
      routineId: routine.id,
      routineName: routine.name,
      duration: finalDuration,
      exerciseSlots: displayList.map((ex) => ({ id: ex.id, name: ex.name, sets: ex.sets })),
      setsData,
    });

    // Build summary
    let totalSets = 0;
    let totalVolume = 0;
    const prs: { name: string; weight: number; reps: number; est1RM: number }[] = [];

    displayList.forEach((ex) => {
      const rawSets = setsData[ex.id] ?? [];
      const doneSets = rawSets.filter((s) => s.done);
      totalSets += doneSets.length;
      doneSets.forEach((s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        totalVolume += w * r;
      });

      // Detect PRs vs previous performance
      const prev = prevPerf[ex.id];
      const maxWeight = Math.max(...doneSets.map((s) => parseFloat(s.weight) || 0), 0);
      const maxReps = Math.max(...doneSets.map((s) => parseInt(s.reps, 10) || 0), 0);
      const est1RM = doneSets.reduce((best, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        return Math.max(best, calculate1RM(w, r));
      }, 0);

      const prevMax = prev ? Math.max(...prev.sets.map((s) => s.weight), 0) : 0;
      const prevEst = prev
        ? Math.max(...prev.sets.map((s) => calculate1RM(s.weight, s.reps)), 0)
        : 0;

      if (maxWeight > 0 && (maxWeight > prevMax || est1RM > prevEst)) {
        prs.push({ name: ex.name, weight: maxWeight, reps: maxReps, est1RM });
      }
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSummaryData({ totalSets, totalVolume, duration: finalDuration, prs });
    setShowSummary(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Summary screen ─────────────────────────────────────────────────────────
  if (showSummary && summaryData) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          {/* Trophy */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 56 }}>🏆</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground, marginTop: 8 }}>
              Treino Concluído!
            </Text>
            <Text style={{ fontSize: 15, color: colors.muted, marginTop: 4 }}>
              {routine.name}
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Duração', value: formatTime(summaryData.duration) },
              { label: 'Séries', value: String(summaryData.totalSets) },
              { label: 'Volume', value: summaryData.totalVolume >= 1000 ? `${(summaryData.totalVolume / 1000).toFixed(1)}t` : `${Math.round(summaryData.totalVolume)}kg` },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* PRs */}
          {summaryData.prs.length > 0 && (
            <View
              style={{
                backgroundColor: '#F97316' + '15',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#F97316' + '30',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#F97316', marginBottom: 10 }}>
                🎯 Novos Recordes Pessoais!
              </Text>
              {summaryData.prs.map((pr, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 6,
                    borderTopWidth: i > 0 ? 1 : 0,
                    borderTopColor: '#F97316' + '20',
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.foreground, flex: 1 }} numberOfLines={1}>
                    {pr.name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#F97316' }}>
                    {pr.weight}kg × {pr.reps} ({pr.est1RM}kg 1RM)
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Exercises summary */}
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
            Exercícios realizados
          </Text>
          {displayList.map((ex) => {
            const rawSets = setsData[ex.id] ?? [];
            const doneSets = rawSets.filter((s) => s.done);
            if (doneSets.length === 0) return null;
            return (
              <View
                key={ex.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>{ex.name}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {doneSets.map((s, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: colors.primary + '20',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                        {s.weight || '—'}kg × {s.reps || '—'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Actions */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 12,
            }}
            onPress={() => router.replace('/marcus' as any)}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Ver Meus Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 15 }}>Ir para o Início</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Active workout screen ──────────────────────────────────────────────────
  const techColor = TECHNIQUE_COLORS[currentEx?.technique] ?? '#6B7280';
  const currentSets = currentEx ? getExSets(currentEx) : [];
  const completedSets = currentSets.filter((s) => s.done).length;
  const currentPrev = currentEx ? prevPerf[currentEx.id] : null;

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border,
    },
    backText: { fontSize: 18, color: colors.foreground },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.muted },
    elapsedBadge: {
      backgroundColor: colors.surface, borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 1, borderColor: colors.border,
    },
    elapsedText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    progressBar: { marginHorizontal: 20, marginBottom: 12 },
    progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
    progressText: { fontSize: 11, color: colors.muted, marginTop: 4, textAlign: 'right' },
    restBanner: {
      marginHorizontal: 20, marginBottom: 12,
      backgroundColor: '#3B82F620', borderRadius: 12, padding: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1, borderColor: '#3B82F640',
    },
    restText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
    restTimer: { fontSize: 22, fontWeight: '800', color: '#3B82F6' },
    skipRestBtn: {
      backgroundColor: '#3B82F620', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    skipRestText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
    exCard: {
      marginHorizontal: 20, marginBottom: 12,
      backgroundColor: colors.surface, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    exHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    exIndexBadge: {
      backgroundColor: colors.primary + '20', borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 4, minWidth: 44, alignItems: 'center',
    },
    exIndexText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    exInfo: { flex: 1 },
    altBadge: {
      backgroundColor: '#6B728020', borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4,
    },
    altBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    exName: { fontSize: 17, fontWeight: '800', color: colors.foreground, lineHeight: 22 },
    exMuscle: { fontSize: 12, color: colors.muted, marginTop: 2 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    metaBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    metaBadgeText: { fontSize: 12, fontWeight: '600' },
    techDesc: {
      borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10,
      backgroundColor: colors.border + '30', borderRadius: 6, padding: 8,
    },
    techDescText: { fontSize: 12, color: colors.muted, lineHeight: 18 },
    toggleBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.border + '40', borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    toggleBtnActive: { backgroundColor: '#6B728020', borderColor: '#6B7280' },
    toggleBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    setsTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8 },
    prevPerfCard: {
      backgroundColor: colors.primary + '10', borderRadius: 10, padding: 10,
      marginBottom: 10, borderWidth: 1, borderColor: colors.primary + '25',
    },
    prevPerfTitle: { fontSize: 11, fontWeight: '600', color: colors.primary, marginBottom: 4 },
    prevPerfRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    prevPerfBadge: {
      backgroundColor: colors.primary + '20', borderRadius: 6,
      paddingHorizontal: 7, paddingVertical: 2,
    },
    prevPerfText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
    setRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
    },
    setNum: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
    },
    setNumDone: { backgroundColor: colors.success },
    setNumText: { fontSize: 13, fontWeight: '700', color: colors.muted },
    setNumTextDone: { color: '#FFF' },
    setInput: {
      flex: 1, height: 40, borderRadius: 10,
      backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 10, fontSize: 15, fontWeight: '600', color: colors.foreground,
      textAlign: 'center',
    },
    setInputDone: { opacity: 0.5 },
    setPrevHint: { fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 2 },
    setDoneBtn: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    setDoneBtnDone: { backgroundColor: colors.success },
    setDoneBtnText: { fontSize: 16, color: '#FFF', fontWeight: '700' },
    navRow: {
      flexDirection: 'row', gap: 10, paddingHorizontal: 20,
      paddingTop: 10, paddingBottom: 16,
    },
    navBtn: {
      flex: 1, height: 50, borderRadius: 14,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border,
    },
    navBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    navBtnFinish: { backgroundColor: '#F97316', borderColor: '#F97316' },
    navBtnText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    navBtnTextPrimary: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{routine.name}</Text>
          <Text style={styles.headerSub}>
            {displayList.filter((_, i) => {
              const ex = displayList[i];
              const sets = setsData[ex?.id] ?? [];
              return sets.every((s) => s.done) && sets.length > 0;
            }).length}/{displayList.length} exercícios
          </Text>
        </View>
        <View style={styles.elapsedBadge}>
          <Text style={styles.elapsedText}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentExIndex + 1) / displayList.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Exercício {currentExIndex + 1} de {displayList.length}
        </Text>
      </View>

      {/* Rest timer banner */}
      {isResting && (
        <View style={styles.restBanner}>
          <Text style={styles.restText}>⏱ Descansando...</Text>
          <Text style={styles.restTimer}>{restSeconds}s</Text>
          <TouchableOpacity
            style={styles.skipRestBtn}
            onPress={() => { setIsResting(false); setRestSeconds(0); }}
          >
            <Text style={styles.skipRestText}>Pular</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exercise card */}
        <View style={styles.exCard}>
          <View style={styles.exHeader}>
            <View style={styles.exIndexBadge}>
              <Text style={styles.exIndexText}>
                {currentExIndex + 1}/{displayList.length}
              </Text>
            </View>
            <View style={styles.exInfo}>
              {currentEx.isAlternative && (
                <View style={styles.altBadge}>
                  <Text style={styles.altBadgeText}>↩ Exercício Alternativo</Text>
                </View>
              )}
              <Text style={styles.exName}>{currentEx.name}</Text>
              <Text style={styles.exMuscle}>
                {currentEx.muscle}
                {currentEx.synergists.length > 0 ? ` • ${currentEx.synergists.join(', ')}` : ''}
              </Text>
            </View>
          </View>

          {/* Meta badges */}
          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.metaBadgeText, { color: colors.primary }]}>
                {currentEx.sets} séries
              </Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: colors.foreground + '10' }]}>
              <Text style={[styles.metaBadgeText, { color: colors.foreground }]}>
                {currentEx.repsRange} reps
              </Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: techColor + '20' }]}>
              <Text style={[styles.metaBadgeText, { color: techColor }]}>
                {currentEx.technique}
              </Text>
            </View>
            {currentEx.bisetGroup !== undefined && (
              <View style={[styles.metaBadge, { backgroundColor: '#8B5CF620' }]}>
                <Text style={[styles.metaBadgeText, { color: '#8B5CF6' }]}>
                  Bi-Set {currentEx.bisetGroup}
                </Text>
              </View>
            )}
          </View>

          {/* Technique description */}
          {currentEx.technique !== 'Tradicional' && (
            <View style={[styles.techDesc, { borderLeftColor: techColor }]}>
              <Text style={styles.techDescText}>
                {TECHNIQUE_DESCRIPTIONS[currentEx.technique]}
              </Text>
            </View>
          )}

          {/* Toggle alternative button */}
          {canToggle && (
            <TouchableOpacity
              style={[styles.toggleBtn, isShowingAlt && styles.toggleBtnActive]}
              onPress={() => toggleAlternative(currentEx.originalIndex)}
            >
              <Text style={{ fontSize: 16 }}>🔄</Text>
              <Text style={[styles.toggleBtnText, isShowingAlt && { color: '#6B7280' }]}>
                {isShowingAlt ? 'Voltar ao exercício principal' : 'Usar exercício alternativo'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Previous performance */}
          {currentPrev && currentPrev.sets.length > 0 && (
            <View style={styles.prevPerfCard}>
              <Text style={styles.prevPerfTitle}>
                📅 Último treino ({new Date(currentPrev.date).toLocaleDateString('pt-BR')})
              </Text>
              <View style={styles.prevPerfRow}>
                {currentPrev.sets.map((s, i) => (
                  <View key={i} style={styles.prevPerfBadge}>
                    <Text style={styles.prevPerfText}>
                      {s.weight}kg × {s.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sets */}
          <Text style={styles.setsTitle}>
            Séries — {completedSets}/{currentEx.sets} concluídas
          </Text>

          {currentSets.map((set, setIdx) => {
            const prevSet = currentPrev?.sets[setIdx];
            return (
              <View key={setIdx}>
                <View style={styles.setRow}>
                  <View style={[styles.setNum, set.done && styles.setNumDone]}>
                    <Text style={[styles.setNumText, set.done && styles.setNumTextDone]}>
                      {set.done ? '✓' : setIdx + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.setInput, set.done && styles.setInputDone]}
                      placeholder={prevSet ? `${prevSet.weight}` : 'Peso (kg)'}
                      placeholderTextColor={prevSet ? colors.primary + '80' : colors.muted}
                      value={set.weight}
                      onChangeText={(v) => updateSet(currentEx.id, setIdx, 'weight', v)}
                      keyboardType="decimal-pad"
                      editable={!set.done}
                      returnKeyType="next"
                    />
                    {prevSet && !set.done && (
                      <Text style={styles.setPrevHint}>ant: {prevSet.weight}kg</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.setInput, set.done && styles.setInputDone]}
                      placeholder={prevSet ? `${prevSet.reps}` : 'Reps'}
                      placeholderTextColor={prevSet ? colors.primary + '80' : colors.muted}
                      value={set.reps}
                      onChangeText={(v) => updateSet(currentEx.id, setIdx, 'reps', v)}
                      keyboardType="number-pad"
                      editable={!set.done}
                      returnKeyType="done"
                    />
                    {prevSet && !set.done && (
                      <Text style={styles.setPrevHint}>ant: {prevSet.reps} reps</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.setDoneBtn, set.done && styles.setDoneBtnDone]}
                    onPress={() => !set.done && markSetDone(currentEx.id, setIdx)}
                  >
                    <Text style={styles.setDoneBtnText}>{set.done ? '✓' : '▶'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentExIndex > 0 && (
          <TouchableOpacity style={styles.navBtn} onPress={goPrev}>
            <Text style={styles.navBtnText}>← Anterior</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.navBtn,
            isLastEx ? styles.navBtnFinish : styles.navBtnPrimary,
            { flex: currentExIndex > 0 ? 1 : 2 },
          ]}
          onPress={goNext}
        >
          <Text style={styles.navBtnTextPrimary}>
            {isLastEx ? '🏆 Finalizar Treino' : 'Próximo →'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
