import { useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getRoutines, deleteRoutine } from "@/store/workoutStore";
import { Routine } from "@/types";

export default function RoutinesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRoutines().then(setRoutines);
    }, [])
  );

  const handleDelete = (routine: Routine) => {
    Alert.alert(
      'Excluir Rotina',
      `Tem certeza que deseja excluir "${routine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(routine.id);
            setRoutines((prev) => prev.filter((r) => r.id !== routine.id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Routine }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        style={{ padding: 16 }}
        onPress={() => router.push({ pathname: '/workout/start', params: { routineId: item.id } } as any)}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base" numberOfLines={1}>{item.name}</Text>
            {item.description ? (
              <Text className="text-muted text-sm mt-1" numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text className="text-muted text-xs mt-2">
              {item.exercises.length} exercícios · {item.exercises.reduce((t, e) => t + e.sets.length, 0)} séries
            </Text>
          </View>
          <View className="flex-row gap-2 ml-3">
            <TouchableOpacity
              style={{ backgroundColor: colors.primary + '20', borderRadius: 10, padding: 8 }}
              onPress={() => router.push({ pathname: '/workout/start', params: { routineId: item.id } } as any)}
            >
              <IconSymbol name="play.fill" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.error + '20', borderRadius: 10, padding: 8 }}
              onPress={() => handleDelete(item)}
            >
              <IconSymbol name="trash.fill" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Exercise preview */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text className="text-muted text-xs" numberOfLines={1}>
          {item.exercises.slice(0, 4).map((e, i) => {
            const ex = require('@/data/exercises').CLASSIC_EXERCISES.find((ex: any) => ex.id === e.exerciseId);
            return ex?.name || e.exerciseId;
          }).join(' · ')}
          {item.exercises.length > 4 ? ` · +${item.exercises.length - 4}` : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-foreground text-2xl font-bold">Rotinas</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 10 }}
          onPress={() => router.push('/routine/new' as any)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center px-8 mt-12">
            <IconSymbol name="list.bullet" size={48} color={colors.muted} />
            <Text className="text-foreground font-semibold text-lg mt-4 text-center">Nenhuma rotina ainda</Text>
            <Text className="text-muted text-sm mt-2 text-center">Crie sua primeira rotina de treino para começar!</Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 14, marginTop: 20, paddingHorizontal: 24, paddingVertical: 12 }}
              onPress={() => router.push('/routine/new' as any)}
            >
              <Text className="text-white font-bold">Criar Rotina</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  );
}
