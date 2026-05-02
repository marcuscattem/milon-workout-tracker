import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LineChart, LineChartPoint } from '@/components/LineChart';
import { useColors } from '@/hooks/use-colors';
import { getExerciseHistory, ExerciseHistoryPoint, calculate1RM } from '@/store/workoutStore';
import { CLASSIC_EXERCISES } from '@/data/exercises';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types';

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
  forearms: '#84CC16',
  full_body: '#6B7280',
};

type MetricKey = 'maxWeight' | 'estimated1RM' | 'totalVolume';

const METRICS: { key: MetricKey; label: string; unit: string; icon: 'bolt.fill' | 'trophy.fill' | 'chart.bar.fill' }[] = [
  { key: 'maxWeight', label: 'Peso Máx.', unit: 'kg', icon: 'bolt.fill' },
  { key: 'estimated1RM', label: '1RM Est.', unit: 'kg', icon: 'trophy.fill' },
  { key: 'totalVolume', label: 'Volume', unit: 'kg', icon: 'chart.bar.fill' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatValue(val: number, unit: string): string {
  if (unit === 'kg' && val >= 1000) return `${(val / 1000).toFixed(1)}t`;
  return `${Math.round(val * 10) / 10}${unit}`;
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { width } = useWindowDimensions();

  const [history, setHistory] = useState<ExerciseHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('maxWeight');

  const exercise = useMemo(
    () => CLASSIC_EXERCISES.find((e) => e.id === id),
    [id]
  );

  const muscleColor = exercise ? (MUSCLE_COLORS[exercise.muscleGroup] || colors.primary) : colors.primary;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      getExerciseHistory(id).then((h) => {
        setHistory(h);
        setLoading(false);
      });
    }, [id])
  );

  // Build chart data for selected metric
  const chartData: LineChartPoint[] = useMemo(() => {
    return history.map((h) => ({
      label: formatDate(h.date),
      value: h[activeMetric],
    }));
  }, [history, activeMetric]);

  // Stats summary
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const weights = history.map((h) => h.maxWeight);
    const rms = history.map((h) => h.estimated1RM);
    const volumes = history.map((h) => h.totalVolume);
    const latest = history[history.length - 1];
    const first = history[0];
    const weightProgress = latest.maxWeight - first.maxWeight;
    return {
      maxWeight: Math.max(...weights),
      best1RM: Math.max(...rms),
      totalSessions: history.length,
      weightProgress,
      latestWeight: latest.maxWeight,
      latestDate: latest.date,
    };
  }, [history]);

  const activeMetricInfo = METRICS.find((m) => m.key === activeMetric)!;
  const chartWidth = width - 32; // 16px padding each side

  if (!exercise) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Exercício não encontrado</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-foreground font-bold"
            style={{ fontSize: 18, lineHeight: 22 }}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
          <View className="flex-row gap-2 mt-1">
            <View
              style={{
                backgroundColor: muscleColor + '20',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: muscleColor, fontSize: 11, fontWeight: '700' }}>
                {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text className="text-muted" style={{ fontSize: 11 }}>
                {EQUIPMENT_LABELS[exercise.equipment]}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Stats Cards */}
        {stats && (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              gap: 10,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: muscleColor, fontSize: 20, fontWeight: '800' }}>
                {stats.maxWeight}kg
              </Text>
              <Text className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                Peso Máx.
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '800' }}>
                {stats.best1RM}kg
              </Text>
              <Text className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                1RM Est.
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <View className="flex-row items-center gap-1">
                <Text style={{ color: stats.weightProgress >= 0 ? colors.success : colors.error, fontSize: 20, fontWeight: '800' }}>
                  {stats.weightProgress >= 0 ? '+' : ''}{stats.weightProgress}kg
                </Text>
              </View>
              <Text className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                Evolução
              </Text>
            </View>
          </View>
        )}

        {/* Chart Card */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          {/* Chart Title + Metric Selector */}
          <View className="flex-row items-center justify-between mb-12">
            <View>
              <Text className="text-foreground font-bold" style={{ fontSize: 15 }}>
                Evolução ao Longo do Tempo
              </Text>
              <Text className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                {history.length > 0
                  ? `${history.length} sessão${history.length !== 1 ? 'ões' : ''} registrada${history.length !== 1 ? 's' : ''}`
                  : 'Nenhuma sessão ainda'}
              </Text>
            </View>
          </View>

          {/* Metric Tabs */}
          <View
            className="flex-row"
            style={{
              backgroundColor: colors.background,
              borderRadius: 10,
              padding: 3,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {METRICS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: activeMetric === m.key ? muscleColor : 'transparent',
                }}
                onPress={() => setActiveMetric(m.key)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: activeMetric === m.key ? '#fff' : colors.muted,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          {loading ? (
            <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={muscleColor} />
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={chartWidth - 32}
              height={200}
              color={muscleColor}
              unit={activeMetricInfo.unit}
              showDots={history.length <= 20}
              showArea
              emptyMessage="Registre treinos para ver sua evolução"
            />
          )}

          {/* Latest value callout */}
          {history.length > 0 && !loading && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: muscleColor + '15',
                borderRadius: 10,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <IconSymbol name={activeMetricInfo.icon} size={18} color={muscleColor} />
              <View>
                <Text style={{ color: muscleColor, fontWeight: '800', fontSize: 16 }}>
                  {formatValue(history[history.length - 1][activeMetric], activeMetricInfo.unit)}
                </Text>
                <Text className="text-muted" style={{ fontSize: 11 }}>
                  Último registro — {formatLongDate(history[history.length - 1].date)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Session History */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text className="text-foreground font-bold" style={{ fontSize: 15, marginBottom: 12 }}>
            Histórico de Sessões
          </Text>

          {loading ? (
            <ActivityIndicator color={muscleColor} />
          ) : history.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="dumbbell.fill" size={32} color={colors.muted} />
              <Text className="text-muted" style={{ marginTop: 10, textAlign: 'center', fontSize: 14 }}>
                Nenhum treino registrado ainda.{'\n'}Inicie um treino com este exercício!
              </Text>
            </View>
          ) : (
            [...history].reverse().map((h, i) => (
              <View
                key={h.workoutId + i}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Date badge */}
                <View
                  style={{
                    backgroundColor: muscleColor + '15',
                    borderRadius: 10,
                    padding: 10,
                    alignItems: 'center',
                    minWidth: 52,
                  }}
                >
                  <Text style={{ color: muscleColor, fontWeight: '800', fontSize: 15 }}>
                    {new Date(h.date).getDate().toString().padStart(2, '0')}
                  </Text>
                  <Text style={{ color: muscleColor, fontSize: 10, fontWeight: '600' }}>
                    {new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>

                {/* Metrics */}
                <View className="flex-1">
                  <Text className="text-foreground font-semibold" style={{ fontSize: 13 }}>
                    {h.workoutName}
                  </Text>
                  <View className="flex-row gap-3 mt-2">
                    <View>
                      <Text className="text-muted" style={{ fontSize: 10 }}>Peso Máx.</Text>
                      <Text style={{ color: muscleColor, fontWeight: '700', fontSize: 13 }}>
                        {h.maxWeight}kg
                      </Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: colors.border }} />
                    <View>
                      <Text className="text-muted" style={{ fontSize: 10 }}>1RM Est.</Text>
                      <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 13 }}>
                        {h.estimated1RM}kg
                      </Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: colors.border }} />
                    <View>
                      <Text className="text-muted" style={{ fontSize: 10 }}>Volume</Text>
                      <Text className="text-foreground font-bold" style={{ fontSize: 13 }}>
                        {formatValue(h.totalVolume, 'kg')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress indicator vs previous */}
                {i < history.length - 1 && (() => {
                  const prev = [...history].reverse()[i + 1];
                  const diff = h.maxWeight - prev.maxWeight;
                  if (diff === 0) return null;
                  return (
                    <View
                      style={{
                        backgroundColor: diff > 0 ? colors.success + '20' : colors.error + '20',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: diff > 0 ? colors.success : colors.error,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
                        {diff > 0 ? '+' : ''}{diff}kg
                      </Text>
                    </View>
                  );
                })()}
              </View>
            ))
          )}
        </View>

        {/* Instructions */}
        {exercise.instructions && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-muted font-semibold" style={{ fontSize: 11, marginBottom: 8 }}>
              COMO EXECUTAR
            </Text>
            <Text className="text-foreground" style={{ fontSize: 14, lineHeight: 21 }}>
              {exercise.instructions}
            </Text>
          </View>
        )}

        {/* Secondary muscles */}
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-muted font-semibold" style={{ fontSize: 11, marginBottom: 10 }}>
              MÚSCULOS SECUNDÁRIOS
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {exercise.secondaryMuscles.map((m) => (
                <View
                  key={m}
                  style={{
                    backgroundColor: (MUSCLE_COLORS[m] || colors.primary) + '20',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      color: MUSCLE_COLORS[m] || colors.primary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {MUSCLE_GROUP_LABELS[m]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
