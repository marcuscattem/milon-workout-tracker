import { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { saveRoutine } from "@/store/workoutStore";
import { Routine, RoutineExercise, RoutineSet } from "@/types";
import { CLASSIC_EXERCISES } from "@/data/exercises";

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export default function NewRoutineScreen() {
  const colors = useColors();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddExercise = (exerciseId: string) => {
    const newEx: RoutineExercise = {
      id: generateId(),
      exerciseId,
      order: exercises.length,
      sets: [
        { id: generateId(), reps: 10, setType: 'normal' },
        { id: generateId(), reps: 10, setType: 'normal' },
        { id: generateId(), reps: 10, setType: 'normal' },
      ],
    };
    setExercises((prev) => [...prev, newEx]);
    setShowPicker(false);
    setSearch('');
  };

  const handleUpdateSets = (exIdx: number, count: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const current = updated[exIdx].sets;
      if (count > current.length) {
        const newSets = [...current];
        while (newSets.length < count) {
          newSets.push({ id: generateId(), reps: 10, setType: 'normal' });
        }
        updated[exIdx] = { ...updated[exIdx], sets: newSets };
      } else {
        updated[exIdx] = { ...updated[exIdx], sets: current.slice(0, count) };
      }
      return updated;
    });
  };

  const handleRemoveExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, dê um nome à sua rotina.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Sem exercícios', 'Adicione pelo menos um exercício à rotina.');
      return;
    }

    const routine: Routine = {
      id: generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      exercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveRoutine(routine);
    router.back();
  };

  const filtered = CLASSIC_EXERCISES.filter(
    (e) => !search || e.name.toLowerCase().includes(search.toLowerCase())
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
          onPress={() => router.back()}
        >
          <IconSymbol name="xmark" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-foreground font-bold text-base flex-1">Nova Rotina</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-sm">Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Name */}
        <View>
          <Text className="text-muted text-xs font-semibold mb-2">NOME DA ROTINA</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Push A, Treino de Pernas..."
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.foreground,
              fontSize: 16,
              fontWeight: '600',
            }}
          />
        </View>

        {/* Description */}
        <View>
          <Text className="text-muted text-xs font-semibold mb-2">DESCRIÇÃO (OPCIONAL)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Peito, Ombros e Tríceps"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.foreground,
              fontSize: 14,
            }}
          />
        </View>

        {/* Exercises */}
        <View>
          <Text className="text-muted text-xs font-semibold mb-3">EXERCÍCIOS</Text>
          <View className="gap-3">
            {exercises.map((re, exIdx) => {
              const ex = CLASSIC_EXERCISES.find((e) => e.id === re.exerciseId);
              return (
                <View
                  key={re.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2 flex-1">
                      <View
                        style={{
                          backgroundColor: colors.primary + '20',
                          borderRadius: 8,
                          padding: 6,
                        }}
                      >
                        <IconSymbol name="dumbbell.fill" size={14} color={colors.primary} />
                      </View>
                      <Text className="text-foreground font-semibold text-sm flex-1" numberOfLines={1}>
                        {ex?.name || re.exerciseId}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{ backgroundColor: colors.error + '20', borderRadius: 8, padding: 6 }}
                      onPress={() => handleRemoveExercise(exIdx)}
                    >
                      <IconSymbol name="trash.fill" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <Text className="text-muted text-sm">Séries:</Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => handleUpdateSets(exIdx, Math.max(1, re.sets.length - 1))}
                      >
                        <Text className="text-foreground font-bold">−</Text>
                      </TouchableOpacity>
                      <Text className="text-foreground font-bold text-base" style={{ minWidth: 24, textAlign: 'center' }}>
                        {re.sets.length}
                      </Text>
                      <TouchableOpacity
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => handleUpdateSets(exIdx, re.sets.length + 1)}
                      >
                        <Text className="text-foreground font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Exercise */}
          <TouchableOpacity
            style={{
              marginTop: 12,
              borderWidth: 1.5,
              borderColor: colors.primary,
              borderStyle: 'dashed',
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={() => setShowPicker(true)}
          >
            <IconSymbol name="plus.circle.fill" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Adicionar Exercício</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise Picker */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '75%',
            }}
          >
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-foreground font-bold text-base">Selecionar Exercício</Text>
                <TouchableOpacity onPress={() => { setShowPicker(false); setSearch(''); }}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: colors.background,
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
                  placeholder="Buscar..."
                  placeholderTextColor={colors.muted}
                  value={search}
                  onChangeText={setSearch}
                  style={{ flex: 1, color: colors.foreground, paddingVertical: 10, fontSize: 14 }}
                />
              </View>
            </View>
            <FlatList
              data={filtered}
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
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: colors.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="dumbbell.fill" size={16} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
                    <Text className="text-muted text-xs mt-0.5">{item.muscleGroup}</Text>
                  </View>
                  <IconSymbol name="plus" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
