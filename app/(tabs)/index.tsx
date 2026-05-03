import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getWorkouts, getWorkoutStats } from "@/store/workoutStore";
import { getRoutines } from "@/store/workoutStore";
import { Workout, Routine } from "@/types";
import { CLASSIC_EXERCISES } from "@/data/exercises";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { MARCUS_ROUTINES } from "@/data/marcus_routines";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}min`;
  return `${m}min`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)}kg`;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    currentStreak: 0,
    thisWeekWorkouts: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();

  // Today's Marcus routine
  const todayMarcusRoutine = (() => {
    const day = new Date().getDay();
    const map: Record<number, string> = { 1: 'marcus_A', 2: 'marcus_B', 3: 'marcus_C', 4: 'marcus_D', 5: 'marcus_E', 6: 'marcus_F', 0: 'marcus_G' };
    return MARCUS_ROUTINES.find(r => r.id === map[day]) ?? null;
  })();

  const loadData = useCallback(async () => {
    const [s, workouts, rts] = await Promise.all([
      getWorkoutStats(),
      getWorkouts(),
      getRoutines(),
    ]);
    setStats(s);
    setRecentWorkouts(workouts.slice(0, 3));
    setRoutines(rts.slice(0, 3));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted text-sm font-medium">{greeting()}</Text>
              <Text className="text-foreground text-2xl font-bold mt-0.5">Mílon</Text>
            </View>
            <View
              style={{ backgroundColor: colors.primary + '20', borderRadius: 12, padding: 10 }}
            >
              <IconSymbol name="flame.fill" size={22} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-5 mt-3">
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-muted text-xs font-medium">Sequência</Text>
              <View className="flex-row items-end gap-1 mt-1">
                <Text className="text-foreground text-2xl font-bold">{stats.currentStreak}</Text>
                <Text className="text-muted text-sm mb-0.5">dias</Text>
              </View>
              <IconSymbol name="flame.fill" size={16} color={colors.warning} />
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-muted text-xs font-medium">Esta semana</Text>
              <View className="flex-row items-end gap-1 mt-1">
                <Text className="text-foreground text-2xl font-bold">{stats.thisWeekWorkouts}</Text>
                <Text className="text-muted text-sm mb-0.5">treinos</Text>
              </View>
              <IconSymbol name="calendar" size={16} color={colors.primary} />
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-muted text-xs font-medium">Volume total</Text>
              <View className="flex-row items-end gap-1 mt-1">
                <Text className="text-foreground text-2xl font-bold">{formatVolume(stats.totalVolume)}</Text>
              </View>
              <IconSymbol name="chart.bar.fill" size={16} color={colors.success} />
            </View>
          </View>
        </View>

        {/* Login Banner — shown when NOT logged in */}
        {!session && (
          <View className="px-5 mt-5">
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: colors.primary + '40',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
              onPress={() => router.push('/login' as any)}
            >
              <View style={{ backgroundColor: colors.primary + '20', borderRadius: 12, padding: 10 }}>
                <Text style={{ fontSize: 22 }}>🔐</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700' }}>Acessar Meus Treinos</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>Faça login para ver seu programa personalizado</Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Marcus Treinos Card — shown when logged in as marcuscattem */}
        {session?.username === 'marcuscattem' && (
          <View className="px-5 mt-5">
            <TouchableOpacity
              style={{
                backgroundColor: '#F97316',
                borderRadius: 16,
                padding: 16,
              }}
              onPress={() => router.push('/marcus' as any)}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Corpo.Ciência</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 2 }}>Meus Treinos</Text>
                  {todayMarcusRoutine && (
                    <Text style={{ color: '#FFFFFF', fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                      Hoje: {todayMarcusRoutine.name} • {todayMarcusRoutine.exercises.filter(e => !e.isAlternative).length} exercícios
                    </Text>
                  )}
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
                  <Text style={{ fontSize: 24 }}>💪</Text>
                </View>
              </View>
              {todayMarcusRoutine && (
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 12 }}
                  onPress={() => router.push({ pathname: '/marcus/workout/[id]' as any, params: { id: todayMarcusRoutine.id } })}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>▶  Iniciar {todayMarcusRoutine.name} Agora</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Start Workout Button */}
        <View className="px-5 mt-5">
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, borderRadius: 16 }}
            className="py-4 flex-row items-center justify-center gap-2"
            onPress={() => router.push('/workout/start' as any)}
          >
            <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
            <Text className="text-white text-base font-bold">Iniciar Treino</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Start Routines */}
        {routines.length > 0 && (
          <View className="mt-6">
            <View className="px-5 flex-row items-center justify-between mb-3">
              <Text className="text-foreground text-base font-bold">Início Rápido</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/routines')}>
                <Text style={{ color: colors.primary }} className="text-sm font-medium">Ver todas</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {routines.map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    padding: 16,
                    width: 160,
                  }}
                  onPress={() => router.push(`/workout/start?routineId=${routine.id}`)}
                >
                  <View
                    style={{ backgroundColor: colors.primary + '20', borderRadius: 10, padding: 8, alignSelf: 'flex-start', marginBottom: 10 }}
                  >
                    <IconSymbol name="dumbbell.fill" size={18} color={colors.primary} />
                  </View>
                  <Text className="text-foreground font-bold text-sm" numberOfLines={2}>{routine.name}</Text>
                  <Text className="text-muted text-xs mt-1" numberOfLines={1}>{routine.description}</Text>
                  <Text className="text-muted text-xs mt-2">{routine.exercises.length} exercícios</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Workouts */}
        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-base font-bold">Treinos Recentes</Text>
            {recentWorkouts.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
                <Text style={{ color: colors.primary }} className="text-sm font-medium">Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentWorkouts.length === 0 ? (
            <View
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <IconSymbol name="dumbbell.fill" size={32} color={colors.muted} />
              <Text className="text-foreground font-semibold mt-3 text-center">Nenhum treino ainda</Text>
              <Text className="text-muted text-sm mt-1 text-center">Inicie seu primeiro treino e comece a acompanhar sua evolução!</Text>
            </View>
          ) : (
            <View className="gap-3">
              {recentWorkouts.map((workout) => {
                const totalSets = workout.exercises.reduce(
                  (t, e) => t + e.sets.filter((s) => s.completed).length,
                  0
                );
                const totalVolume = workout.exercises.reduce(
                  (t, e) =>
                    t +
                    e.sets
                      .filter((s) => s.completed)
                      .reduce((st, s) => st + s.weight * s.reps, 0),
                  0
                );
                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: 16,
                    }}
                    onPress={() => {}}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm" numberOfLines={1}>{workout.name}</Text>
                        <Text className="text-muted text-xs mt-1">{formatDate(workout.date)}</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                    </View>
                    <View className="flex-row gap-4 mt-3">
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="timer" size={13} color={colors.muted} />
                        <Text className="text-muted text-xs">{formatDuration(workout.duration)}</Text>
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
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
