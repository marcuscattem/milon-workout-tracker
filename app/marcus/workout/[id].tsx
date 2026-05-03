/**
 * app/marcus/workout/[id].tsx
 *
 * Tela de treino ativo do Marcus Cattem.
 * Funcionalidades:
 * - Navega exercício a exercício
 * - Botão 🔄 para alternar entre exercício principal e alternativo
 * - Registro de peso e reps por série
 * - Timer de descanso
 * - Badge de técnica com descrição
 * - Resumo ao finalizar
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MARCUS_ROUTINES, ExerciseSlot } from '@/data/marcus_routines';

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

interface SetData {
  weight: string;
  reps: string;
  done: boolean;
}

export default function MarcusWorkoutScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const routine = MARCUS_ROUTINES.find((r) => r.id === id);

  // Which exercises are showing alternative (key = originalIndex)
  const [showingAlternative, setShowingAlternative] = useState<Record<number, boolean>>({});

  // Current exercise index in the display list
  const [currentExIndex, setCurrentExIndex] = useState(0);

  // Sets data: key = exerciseId, value = array of SetData
  const [setsData, setSetsData] = useState<Record<string, SetData[]>>({});

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Workout duration
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  // Rest timer logic
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isResting, restSeconds]);

  if (!routine) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Treino não encontrado.</Text>
      </ScreenContainer>
    );
  }

  // Build display list of main exercises (respecting alternative toggles)
  const buildDisplayList = (): (ExerciseSlot & { originalIndex: number })[] => {
    const result: (ExerciseSlot & { originalIndex: number })[] = [];
    routine.exercises.forEach((ex, idx) => {
      if (ex.isAlternative) return;
      const isShowingAlt = showingAlternative[idx];
      if (isShowingAlt) {
        const alt = routine.exercises.find(
          (e) => e.isAlternative && e.alternativeFor === idx
        );
        if (alt) {
          result.push({ ...alt, originalIndex: idx });
          return;
        }
      }
      result.push({ ...ex, originalIndex: idx });
    });
    return result;
  };

  const displayList = buildDisplayList();
  const currentEx = displayList[currentExIndex];

  // Initialize sets for current exercise if not yet done
  const getExSets = (ex: ExerciseSlot): SetData[] => {
    if (setsData[ex.id]) return setsData[ex.id];
    return Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false }));
  };

  const updateSet = (exId: string, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setSetsData((prev) => {
      const current = prev[exId] ?? getExSets(currentEx);
      const updated = current.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      return { ...prev, [exId]: updated };
    });
  };

  const markSetDone = (exId: string, setIdx: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSetsData((prev) => {
      const current = prev[exId] ?? getExSets(currentEx);
      const updated = current.map((s, i) =>
        i === setIdx ? { ...s, done: true } : s
      );
      return { ...prev, [exId]: updated };
    });
    // Start rest timer (90s default)
    setRestSeconds(90);
    setIsResting(true);
  };

  const toggleAlternative = (originalIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowingAlternative((prev) => ({
      ...prev,
      [originalIndex]: !prev[originalIndex],
    }));
  };

  const hasAlternative = (originalIndex: number): boolean => {
    return routine.exercises.some(
      (e) => e.isAlternative && e.alternativeFor === originalIndex
    );
  };

  const goNext = () => {
    if (currentExIndex < displayList.length - 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentExIndex((i) => i + 1);
    } else {
      finishWorkout();
    }
  };

  const goPrev = () => {
    if (currentExIndex > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentExIndex((i) => i - 1);
    }
  };

  const finishWorkout = () => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalSets = Object.values(setsData).reduce(
      (acc, sets) => acc + sets.filter((s) => s.done).length,
      0
    );
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    Alert.alert(
      '🏆 Treino Concluído!',
      `${routine.name} finalizado!\n\nDuração: ${mins}m ${secs}s\nSéries completadas: ${totalSets}`,
      [
        {
          text: 'Ver Resumo',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const techColor = TECHNIQUE_COLORS[currentEx?.technique] ?? '#6B7280';
  const currentSets = currentEx ? getExSets(currentEx) : [];
  const completedSets = currentSets.filter((s) => s.done).length;

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
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    backText: { fontSize: 18, color: colors.foreground },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.muted },
    elapsedBadge: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    elapsedText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    progressBar: {
      marginHorizontal: 20,
      marginBottom: 12,
    },
    progressTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      textAlign: 'right',
    },
    restBanner: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: '#3B82F620',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#3B82F640',
    },
    restText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
    restTimer: { fontSize: 22, fontWeight: '800', color: '#3B82F6' },
    skipRestBtn: {
      backgroundColor: '#3B82F620',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    skipRestText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
    exCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 10,
    },
    exIndexBadge: {
      backgroundColor: colors.primary + '20',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    exIndexText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    exInfo: { flex: 1 },
    exName: { fontSize: 17, fontWeight: '800', color: colors.foreground, lineHeight: 22 },
    exMuscle: { fontSize: 13, color: colors.muted, marginTop: 2 },
    altBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    altBadgeText: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    metaBadge: {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    metaBadgeText: { fontSize: 13, fontWeight: '600' },
    techDesc: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      borderLeftWidth: 3,
      marginBottom: 12,
    },
    techDescText: { fontSize: 12, color: colors.muted, lineHeight: 17 },
    toggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    toggleBtnText: { fontSize: 13, fontWeight: '600', color: colors.muted },
    toggleBtnActive: { borderColor: '#6B7280', backgroundColor: '#6B728015' },
    setsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    setNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setNumDone: { backgroundColor: colors.success },
    setNumText: { fontSize: 13, fontWeight: '700', color: colors.muted },
    setNumTextDone: { color: '#FFFFFF' },
    setInput: {
      flex: 1,
      height: 40,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      fontSize: 15,
      color: colors.foreground,
      textAlign: 'center',
    },
    setInputDone: { borderColor: colors.success + '60', backgroundColor: colors.success + '10' },
    setDoneBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setDoneBtnDone: { backgroundColor: colors.success },
    setDoneBtnText: { fontSize: 18 },
    navRow: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    navBtn: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    navBtnFinish: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    navBtnText: { fontSize: 15, fontWeight: '700', color: colors.muted },
    navBtnTextPrimary: { color: '#FFFFFF' },
  });

  if (!currentEx) return null;

  const isShowingAlt = showingAlternative[currentEx.originalIndex];
  const canToggle = hasAlternative(currentEx.originalIndex);
  const isLastEx = currentExIndex === displayList.length - 1;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Alert.alert('Sair do treino?', 'O progresso não será salvo.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => router.back() },
            ]);
          }}
        >
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{routine.name}</Text>
          <Text style={styles.headerSub}>{routine.weekday}</Text>
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
            onPress={() => {
              setIsResting(false);
              setRestSeconds(0);
            }}
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

          {/* Sets */}
          <Text style={styles.setsTitle}>
            Séries — {completedSets}/{currentEx.sets} concluídas
          </Text>

          {currentSets.map((set, setIdx) => (
            <View key={setIdx} style={styles.setRow}>
              <View style={[styles.setNum, set.done && styles.setNumDone]}>
                <Text style={[styles.setNumText, set.done && styles.setNumTextDone]}>
                  {set.done ? '✓' : setIdx + 1}
                </Text>
              </View>

              <TextInput
                style={[styles.setInput, set.done && styles.setInputDone]}
                placeholder="Peso (kg)"
                placeholderTextColor={colors.muted}
                value={set.weight}
                onChangeText={(v) => updateSet(currentEx.id, setIdx, 'weight', v)}
                keyboardType="decimal-pad"
                editable={!set.done}
              />

              <TextInput
                style={[styles.setInput, set.done && styles.setInputDone]}
                placeholder="Reps"
                placeholderTextColor={colors.muted}
                value={set.reps}
                onChangeText={(v) => updateSet(currentEx.id, setIdx, 'reps', v)}
                keyboardType="number-pad"
                editable={!set.done}
              />

              <TouchableOpacity
                style={[styles.setDoneBtn, set.done && styles.setDoneBtnDone]}
                onPress={() => !set.done && markSetDone(currentEx.id, setIdx)}
              >
                <Text style={styles.setDoneBtnText}>{set.done ? '✓' : '▶'}</Text>
              </TouchableOpacity>
            </View>
          ))}
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
