import { useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getWorkouts, getPersonalRecords, calculate1RM } from "@/store/workoutStore";
import { Workout, PersonalRecord } from "@/types";
import { CLASSIC_EXERCISES } from "@/data/exercises";
import { MUSCLE_GROUP_LABELS } from "@/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)}kg`;
}

export default function ProgressScreen() {
  const colors = useColors();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'prs' | 'history'>('overview');

  useFocusEffect(
    useCallback(() => {
      Promise.all([getWorkouts(), getPersonalRecords()]).then(([w, p]) => {
        setWorkouts(w);
        setPrs(p);
      });
    }, [])
  );

  // Weekly volume data (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; volume: number; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekWorkouts = workouts.filter((w) => {
        const d = new Date(w.date);
        return d >= weekStart && d < weekEnd;
      });

      const volume = weekWorkouts.reduce((t, w) => {
        return t + w.exercises.reduce((et, e) => {
          return et + e.sets.filter((s) => s.completed).reduce((st, s) => st + s.weight * s.reps, 0);
        }, 0);
      }, 0);

      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeks.push({ label, volume, count: weekWorkouts.length });
    }
    return weeks;
  }, [workouts]);

  const maxVolume = Math.max(...weeklyData.map((w) => w.volume), 1);

  // Muscle group distribution
  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        const ex = CLASSIC_EXERCISES.find((ex) => ex.id === e.exerciseId);
        if (ex) {
          counts[ex.muscleGroup] = (counts[ex.muscleGroup] || 0) + e.sets.filter((s) => s.completed).length;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [workouts]);

  const totalSets = muscleDistribution.reduce((t, [, v]) => t + v, 0);

  const MUSCLE_COLORS: Record<string, string> = {
    chest: '#FF6B35',
    back: '#4A90D9',
    legs: '#7B68EE',
    shoulders: '#F59E0B',
    biceps: '#22C55E',
    triceps: '#EF4444',
    abs: '#06B6D4',
    glutes: '#EC4899',
    calves: '#8B5CF6',
    cardio: '#F97316',
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">Progresso</Text>
      </View>

      {/* Tab Selector */}
      <View className="px-5 mb-4">
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 4,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {(['overview', 'prs', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={{
                  color: activeTab === tab ? '#fff' : colors.muted,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {tab === 'overview' ? 'Visão Geral' : tab === 'prs' ? 'Recordes' : 'Histórico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {activeTab === 'overview' && (
          <View className="px-5 gap-5">
            {/* Summary Stats */}
            <View className="flex-row gap-3">
              <View
                style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 }}
              >
                <Text className="text-muted text-xs font-medium">Total de Treinos</Text>
                <Text className="text-foreground text-2xl font-bold mt-1">{workouts.length}</Text>
              </View>
              <View
                style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 }}
              >
                <Text className="text-muted text-xs font-medium">Volume Total</Text>
                <Text className="text-foreground text-2xl font-bold mt-1">
                  {formatVolume(workouts.reduce((t, w) => t + w.exercises.reduce((et, e) => et + e.sets.filter((s) => s.completed).reduce((st, s) => st + s.weight * s.reps, 0), 0), 0))}
                </Text>
              </View>
            </View>

            {/* Weekly Volume Chart */}
            <View
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}
            >
              <Text className="text-foreground font-bold mb-4">Volume Semanal</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 }}>
                {weeklyData.map((week, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        width: '100%',
                        height: Math.max((week.volume / maxVolume) * 80, week.volume > 0 ? 4 : 0),
                        backgroundColor: i === weeklyData.length - 1 ? colors.primary : colors.primary + '60',
                        borderRadius: 4,
                      }}
                    />
                    <Text className="text-muted" style={{ fontSize: 9 }}>{week.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Muscle Distribution */}
            {muscleDistribution.length > 0 && (
              <View
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}
              >
                <Text className="text-foreground font-bold mb-4">Grupos Musculares</Text>
                <View className="gap-3">
                  {muscleDistribution.map(([muscle, count]) => {
                    const pct = totalSets > 0 ? (count / totalSets) * 100 : 0;
                    const mc = MUSCLE_COLORS[muscle] || colors.primary;
                    return (
                      <View key={muscle}>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-foreground text-sm font-medium">
                            {MUSCLE_GROUP_LABELS[muscle as keyof typeof MUSCLE_GROUP_LABELS] || muscle}
                          </Text>
                          <Text className="text-muted text-xs">{Math.round(pct)}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                          <View style={{ height: 6, width: `${pct}%`, backgroundColor: mc, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'prs' && (
          <View className="px-5 gap-3">
            {prs.length === 0 ? (
              <View className="items-center mt-12">
                <IconSymbol name="trophy.fill" size={48} color={colors.muted} />
                <Text className="text-foreground font-semibold text-lg mt-4 text-center">Nenhum recorde ainda</Text>
                <Text className="text-muted text-sm mt-2 text-center">Complete treinos para registrar seus recordes pessoais!</Text>
              </View>
            ) : (
              prs.map((pr) => {
                const ex = CLASSIC_EXERCISES.find((e) => e.id === pr.exerciseId);
                return (
                  <View
                    key={pr.exerciseId}
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}
                  >
                    <View className="flex-row items-center gap-3 mb-3">
                      <View style={{ backgroundColor: '#F59E0B20', borderRadius: 10, padding: 8 }}>
                        <IconSymbol name="trophy.fill" size={18} color="#F59E0B" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm">{ex?.name || pr.exerciseId}</Text>
                        <Text className="text-muted text-xs mt-0.5">{formatDate(pr.date)}</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-3">
                      <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                        <Text className="text-foreground font-bold text-base">{pr.maxWeight}kg</Text>
                        <Text className="text-muted text-xs mt-0.5">Peso Máx.</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                        <Text className="text-foreground font-bold text-base">{Math.round(pr.estimated1RM)}kg</Text>
                        <Text className="text-muted text-xs mt-0.5">1RM Est.</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                        <Text className="text-foreground font-bold text-base">{formatVolume(pr.maxVolume)}</Text>
                        <Text className="text-muted text-xs mt-0.5">Vol. Máx.</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View className="px-5 gap-3">
            {workouts.length === 0 ? (
              <View className="items-center mt-12">
                <IconSymbol name="calendar" size={48} color={colors.muted} />
                <Text className="text-foreground font-semibold text-lg mt-4 text-center">Nenhum histórico ainda</Text>
              </View>
            ) : (
              workouts.map((workout) => {
                const totalVolume = workout.exercises.reduce((t, e) => t + e.sets.filter((s) => s.completed).reduce((st, s) => st + s.weight * s.reps, 0), 0);
                const totalSets = workout.exercises.reduce((t, e) => t + e.sets.filter((s) => s.completed).length, 0);
                const duration = Math.floor(workout.duration / 60);
                return (
                  <View
                    key={workout.id}
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm">{workout.name}</Text>
                        <Text className="text-muted text-xs mt-1">{formatDate(workout.date)}</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-4 mt-3">
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="timer" size={13} color={colors.muted} />
                        <Text className="text-muted text-xs">{duration}min</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="dumbbell.fill" size={13} color={colors.muted} />
                        <Text className="text-muted text-xs">{workout.exercises.length} exercícios</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="chart.bar.fill" size={13} color={colors.muted} />
                        <Text className="text-muted text-xs">{formatVolume(totalVolume)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
