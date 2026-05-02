import { useState, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CLASSIC_EXERCISES } from "@/data/exercises";
import { Exercise, MuscleGroup, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from "@/types";

const MUSCLE_FILTERS: { key: MuscleGroup | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'chest', label: 'Peito' },
  { key: 'back', label: 'Costas' },
  { key: 'legs', label: 'Pernas' },
  { key: 'shoulders', label: 'Ombros' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'abs', label: 'Abdômen' },
  { key: 'glutes', label: 'Glúteos' },
  { key: 'cardio', label: 'Cardio' },
];

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

export default function ExercisesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    return CLASSIC_EXERCISES.filter((e) => {
      const matchesMuscle = selectedMuscle === 'all' || e.muscleGroup === selectedMuscle;
      const matchesSearch =
        !search || e.name.toLowerCase().includes(search.toLowerCase());
      return matchesMuscle && matchesSearch;
    });
  }, [search, selectedMuscle]);

  const renderItem = ({ item }: { item: Exercise }) => {
    const muscleColor = MUSCLE_COLORS[item.muscleGroup] || colors.primary;
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          padding: 14,
          marginHorizontal: 20,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
        onPress={() => setSelectedExercise(item)}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: muscleColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name="dumbbell.fill" size={20} color={muscleColor} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
          <View className="flex-row gap-2 mt-1">
            <View
              style={{
                backgroundColor: muscleColor + '20',
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: muscleColor, fontSize: 11, fontWeight: '600' }}>
                {MUSCLE_GROUP_LABELS[item.muscleGroup]}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text className="text-muted" style={{ fontSize: 11 }}>
                {EQUIPMENT_LABELS[item.equipment]}
              </Text>
            </View>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">Exercícios</Text>
        <Text className="text-muted text-sm mt-1">{CLASSIC_EXERCISES.length} exercícios disponíveis</Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            gap: 10,
          }}
        >
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            placeholder="Buscar exercício..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.foreground, paddingVertical: 12, fontSize: 15 }}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Muscle Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
      >
        {MUSCLE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: selectedMuscle === f.key ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedMuscle === f.key ? colors.primary : colors.border,
            }}
            onPress={() => setSelectedMuscle(f.key)}
          >
            <Text
              style={{
                color: selectedMuscle === f.key ? '#fff' : colors.foreground,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View className="px-5 mb-2">
        <Text className="text-muted text-xs">{filtered.length} exercícios</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-foreground text-xl font-bold">{selectedExercise.name}</Text>
              <View className="flex-row gap-2 mt-2">
                <View
                  style={{
                    backgroundColor: (MUSCLE_COLORS[selectedExercise.muscleGroup] || colors.primary) + '20',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: MUSCLE_COLORS[selectedExercise.muscleGroup] || colors.primary, fontSize: 12, fontWeight: '700' }}>
                    {MUSCLE_GROUP_LABELS[selectedExercise.muscleGroup]}
                  </Text>
                </View>
                <View
                  style={{ backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
                >
                  <Text className="text-muted" style={{ fontSize: 12 }}>
                    {EQUIPMENT_LABELS[selectedExercise.equipment]}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 8 }}
              onPress={() => setSelectedExercise(null)}
            >
              <IconSymbol name="xmark" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {selectedExercise.instructions && (
            <View
              style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 16 }}
            >
              <Text className="text-muted text-xs font-semibold mb-2">INSTRUÇÕES</Text>
              <Text className="text-foreground text-sm leading-relaxed">{selectedExercise.instructions}</Text>
            </View>
          )}

          {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
            <View className="mb-4">
              <Text className="text-muted text-xs font-semibold mb-2">MÚSCULOS SECUNDÁRIOS</Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedExercise.secondaryMuscles.map((m) => (
                  <View key={m} style={{ backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text className="text-muted" style={{ fontSize: 12 }}>{MUSCLE_GROUP_LABELS[m]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
