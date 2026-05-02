import { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  getRoutines,
  saveWorkout,
  getWorkouts,
  calculate1RM,
} from "@/store/workoutStore";
import {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Routine,
  RoutineExercise,
  SetType,
} from "@/types";
import { CLASSIC_EXERCISES } from "@/data/exercises";

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const RPE_LABELS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const RPE_COLORS = ['', '#22C55E', '#22C55E', '#4ADE80', '#84CC16', '#F59E0B', '#F59E0B', '#F97316', '#EF4444', '#EF4444', '#DC2626'];

export default function WorkoutStartScreen() {
  const colors = useColors();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();

  useKeepAwake();

  const [workoutName, setWorkoutName] = useState('Treino Livre');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showRestModal, setShowRestModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [previousData, setPreviousData] = useState<Record<string, { weight: number; reps: number }[]>>({});
  const [showRPEPicker, setShowRPEPicker] = useState<{ exerciseIdx: number; setIdx: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load routine
  useEffect(() => {
    const init = async () => {
      if (routineId) {
        const routines = await getRoutines();
        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          setWorkoutName(routine.name);
          const exs: WorkoutExercise[] = routine.exercises.map((re) => ({
            id: generateId(),
            exerciseId: re.exerciseId,
            order: re.order,
            sets: re.sets.map((rs, idx) => ({
              id: generateId(),
              exerciseId: re.exerciseId,
              setNumber: idx + 1,
              weight: rs.weight || 0,
              reps: rs.reps,
              setType: rs.setType,
              completed: false,
            })),
          }));
          setExercises(exs);
          await loadPreviousData(exs.map((e) => e.exerciseId));
        }
      }
    };
    init();
  }, [routineId]);

  // Main timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Rest timer
  useEffect(() => {
    if (restActive && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            setRestActive(false);
            setShowRestModal(false);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (restRef.current) clearInterval(restRef.current);
    }
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restActive]);

  const loadPreviousData = async (exerciseIds: string[]) => {
    const workouts = await getWorkouts();
    const prev: Record<string, { weight: number; reps: number }[]> = {};
    for (const exId of exerciseIds) {
      for (const workout of workouts) {
        const we = workout.exercises.find((e) => e.exerciseId === exId);
        if (we) {
          prev[exId] = we.sets.filter((s) => s.completed).map((s) => ({ weight: s.weight, reps: s.reps }));
          break;
        }
      }
    }
    setPreviousData(prev);
  };

  const startRestTimer = () => {
    setRestTimer(restDuration);
    setRestActive(true);
    setShowRestModal(true);
  };

  const handleCompleteSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const set = { ...updated[exerciseIdx].sets[setIdx] };
      set.completed = !set.completed;
      updated[exerciseIdx] = {
        ...updated[exerciseIdx],
        sets: updated[exerciseIdx].sets.map((s, i) => (i === setIdx ? set : s)),
      };
      return updated;
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    startRestTimer();
  };

  const handleUpdateSet = (exerciseIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx] = {
        ...updated[exerciseIdx],
        sets: updated[exerciseIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, [field]: num } : s
        ),
      };
      return updated;
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const lastSet = updated[exerciseIdx].sets[updated[exerciseIdx].sets.length - 1];
      const newSet: WorkoutSet = {
        id: generateId(),
        exerciseId: updated[exerciseIdx].exerciseId,
        setNumber: updated[exerciseIdx].sets.length + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 10,
        setType: 'normal',
        completed: false,
      };
      updated[exerciseIdx] = {
        ...updated[exerciseIdx],
        sets: [...updated[exerciseIdx].sets, newSet],
      };
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      if (updated[exerciseIdx].sets.length <= 1) return prev;
      updated[exerciseIdx] = {
        ...updated[exerciseIdx],
        sets: updated[exerciseIdx].sets.filter((_, i) => i !== setIdx),
      };
      return updated;
    });
  };

  const handleAddExercise = async (exerciseId: string) => {
    const newEx: WorkoutExercise = {
      id: generateId(),
      exerciseId,
      order: exercises.length,
      sets: [
        {
          id: generateId(),
          exerciseId,
          setNumber: 1,
          weight: 0,
          reps: 10,
          setType: 'normal',
          completed: false,
        },
      ],
    };
    setExercises((prev) => [...prev, newEx]);
    await loadPreviousData([...exercises.map((e) => e.exerciseId), exerciseId]);
    setShowExercisePicker(false);
    setExerciseSearch('');
  };

  const handleSetRPE = (exerciseIdx: number, setIdx: number, rpe: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx] = {
        ...updated[exerciseIdx],
        sets: updated[exerciseIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, rpe } : s
        ),
      };
      return updated;
    });
    setShowRPEPicker(null);
  };

  const handleFinish = () => {
    const completedSets = exercises.reduce(
      (t, e) => t + e.sets.filter((s) => s.completed).length,
      0
    );
    if (completedSets === 0) {
      Alert.alert('Nenhuma série concluída', 'Complete pelo menos uma série antes de finalizar.');
      return;
    }

    Alert.alert(
      'Finalizar Treino',
      `${completedSets} séries concluídas em ${formatTime(elapsed)}. Deseja salvar?`,
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            const workout: Workout = {
              id: generateId(),
              name: workoutName,
              date: new Date().toISOString(),
              duration: elapsed,
              exercises,
              routineId: routineId || undefined,
            };
            await saveWorkout(workout);
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          },
        },
      ]
    );
  };

  const filteredExercises = CLASSIC_EXERCISES.filter(
    (e) => !exerciseSearch || e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 12,
        }}
      >
        <TouchableOpacity
          style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 8 }}
          onPress={() => {
            Alert.alert('Cancelar Treino', 'O treino não será salvo. Deseja sair?', [
              { text: 'Continuar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => router.back() },
            ]);
          }}
        >
          <IconSymbol name="xmark" size={18} color={colors.foreground} />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-foreground font-bold text-base" numberOfLines={1}>{workoutName}</Text>
          <Text className="text-muted text-xs">{formatTime(elapsed)}</Text>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}
          onPress={handleFinish}
        >
          <Text className="text-white font-bold text-sm">Finalizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Exercises */}
        {exercises.map((we, exIdx) => {
          const exercise = CLASSIC_EXERCISES.find((e) => e.id === we.exerciseId);
          const prevData = previousData[we.exerciseId] || [];
          const completedSets = we.sets.filter((s) => s.completed).length;
          const totalVolume = we.sets.filter((s) => s.completed).reduce((t, s) => t + s.weight * s.reps, 0);

          return (
            <View
              key={we.id}
              style={{
                margin: 16,
                marginBottom: 0,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              {/* Exercise Header */}
              <View
                style={{
                  padding: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.primary + '20',
                    borderRadius: 10,
                    padding: 8,
                  }}
                >
                  <IconSymbol name="dumbbell.fill" size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm">{exercise?.name || we.exerciseId}</Text>
                  <Text className="text-muted text-xs mt-0.5">
                    {completedSets}/{we.sets.length} séries
                    {totalVolume > 0 ? ` · ${Math.round(totalVolume)}kg vol.` : ''}
                  </Text>
                </View>
              </View>

              {/* Sets Header */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  gap: 8,
                }}
              >
                <Text className="text-muted text-xs font-semibold" style={{ width: 28 }}>#</Text>
                <Text className="text-muted text-xs font-semibold" style={{ flex: 1 }}>ANTERIOR</Text>
                <Text className="text-muted text-xs font-semibold" style={{ width: 72, textAlign: 'center' }}>KG</Text>
                <Text className="text-muted text-xs font-semibold" style={{ width: 56, textAlign: 'center' }}>REPS</Text>
                <Text className="text-muted text-xs font-semibold" style={{ width: 36, textAlign: 'center' }}>RPE</Text>
                <View style={{ width: 36 }} />
              </View>

              {/* Sets */}
              {we.sets.map((set, setIdx) => {
                const prev = prevData[setIdx];
                const est1RM = set.weight > 0 && set.reps > 0 ? calculate1RM(set.weight, set.reps) : null;

                return (
                  <View
                    key={set.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      gap: 8,
                      backgroundColor: set.completed ? colors.success + '10' : 'transparent',
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    {/* Set Number */}
                    <TouchableOpacity
                      style={{ width: 28, alignItems: 'center' }}
                      onLongPress={() => handleRemoveSet(exIdx, setIdx)}
                    >
                      <Text
                        style={{
                          color: set.completed ? colors.success : colors.muted,
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {setIdx + 1}
                      </Text>
                    </TouchableOpacity>

                    {/* Previous */}
                    <View style={{ flex: 1 }}>
                      {prev ? (
                        <Text className="text-muted" style={{ fontSize: 11 }}>
                          {prev.weight}kg × {prev.reps}
                        </Text>
                      ) : (
                        <Text className="text-muted" style={{ fontSize: 11 }}>—</Text>
                      )}
                    </View>

                    {/* Weight */}
                    <TextInput
                      style={{
                        width: 72,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: set.completed ? colors.success + '60' : colors.border,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        color: colors.foreground,
                        fontSize: 14,
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                      value={set.weight > 0 ? String(set.weight) : ''}
                      onChangeText={(v) => handleUpdateSet(exIdx, setIdx, 'weight', v)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                    />

                    {/* Reps */}
                    <TextInput
                      style={{
                        width: 56,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: set.completed ? colors.success + '60' : colors.border,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        color: colors.foreground,
                        fontSize: 14,
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                      value={set.reps > 0 ? String(set.reps) : ''}
                      onChangeText={(v) => handleUpdateSet(exIdx, setIdx, 'reps', v)}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                    />

                    {/* RPE */}
                    <TouchableOpacity
                      style={{
                        width: 36,
                        height: 34,
                        backgroundColor: set.rpe ? RPE_COLORS[set.rpe] + '30' : colors.background,
                        borderWidth: 1,
                        borderColor: set.rpe ? RPE_COLORS[set.rpe] : colors.border,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowRPEPicker({ exerciseIdx: exIdx, setIdx })}
                    >
                      <Text
                        style={{
                          color: set.rpe ? RPE_COLORS[set.rpe] : colors.muted,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
                        {set.rpe || '—'}
                      </Text>
                    </TouchableOpacity>

                    {/* Complete */}
                    <TouchableOpacity
                      style={{
                        width: 36,
                        height: 34,
                        backgroundColor: set.completed ? colors.success : colors.background,
                        borderWidth: 1,
                        borderColor: set.completed ? colors.success : colors.border,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleCompleteSet(exIdx, setIdx)}
                    >
                      <IconSymbol
                        name={set.completed ? "checkmark.circle.fill" : "checkmark.circle"}
                        size={18}
                        color={set.completed ? '#fff' : colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Add Set */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
                onPress={() => handleAddSet(exIdx)}
              >
                <IconSymbol name="plus" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Adicionar Série</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={{
            margin: 16,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onPress={() => setShowExercisePicker(true)}
        >
          <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Adicionar Exercício</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rest Timer Modal */}
      <Modal visible={showRestModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 32,
              alignItems: 'center',
            }}
          >
            <Text className="text-foreground font-bold text-lg mb-2">Descanso</Text>
            <Text style={{ color: colors.primary, fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
              {formatTime(restTimer)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={{ backgroundColor: colors.border, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 }}
                onPress={() => setRestTimer((t) => Math.max(0, t - 15))}
              >
                <Text className="text-foreground font-semibold">-15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: colors.border, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 }}
                onPress={() => setRestTimer((t) => t + 15)}
              >
                <Text className="text-foreground font-semibold">+15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: colors.error + '20', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 }}
                onPress={() => { setRestActive(false); setShowRestModal(false); }}
              >
                <Text style={{ color: colors.error, fontWeight: '600' }}>Pular</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Picker Modal */}
      <Modal visible={showExercisePicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '80%',
            }}
          >
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-foreground font-bold text-lg">Adicionar Exercício</Text>
                <TouchableOpacity onPress={() => { setShowExercisePicker(false); setExerciseSearch(''); }}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
                <TextInput
                  placeholder="Buscar exercício..."
                  placeholderTextColor={colors.muted}
                  value={exerciseSearch}
                  onChangeText={setExerciseSearch}
                  style={{ flex: 1, color: colors.foreground, paddingVertical: 10, fontSize: 14 }}
                />
              </View>
            </View>
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    gap: 12,
                  }}
                  onPress={() => handleAddExercise(item.id)}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="dumbbell.fill" size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
                    <Text className="text-muted text-xs mt-0.5">{item.muscleGroup}</Text>
                  </View>
                  <IconSymbol name="plus" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* RPE Picker Modal */}
      <Modal visible={!!showRPEPicker} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowRPEPicker(null)}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              width: 300,
            }}
          >
            <Text className="text-foreground font-bold text-base mb-4 text-center">RPE (Esforço Percebido)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                <TouchableOpacity
                  key={rpe}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: RPE_COLORS[rpe] + '30',
                    borderWidth: 2,
                    borderColor: RPE_COLORS[rpe],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    if (showRPEPicker) {
                      handleSetRPE(showRPEPicker.exerciseIdx, showRPEPicker.setIdx, rpe);
                    }
                  }}
                >
                  <Text style={{ color: RPE_COLORS[rpe], fontWeight: '800', fontSize: 16 }}>{rpe}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-muted text-xs text-center mt-3">1 = Muito fácil · 10 = Máximo esforço</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}
