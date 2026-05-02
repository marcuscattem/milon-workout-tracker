import { useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getUserProfile, saveUserProfile, getWorkouts, getWorkoutStats } from "@/store/workoutStore";
import { UserProfile } from "@/types";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<UserProfile>({ name: 'Atleta', unit: 'kg', theme: 'system' });
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0, currentStreak: 0, thisWeekWorkouts: 0 });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useFocusEffect(
    useCallback(() => {
      Promise.all([getUserProfile(), getWorkoutStats()]).then(([p, s]) => {
        setProfile(p);
        setStats(s);
      });
    }, [])
  );

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    const updated = { ...profile, name: editName.trim() };
    await saveUserProfile(updated);
    setProfile(updated);
    setEditing(false);
  };

  const handleToggleUnit = async () => {
    const updated = { ...profile, unit: profile.unit === 'kg' ? 'lb' : 'kg' } as UserProfile;
    await saveUserProfile(updated);
    setProfile(updated);
  };

  const formatVolume = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
    return `${Math.round(kg)}kg`;
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-foreground text-2xl font-bold">Perfil</Text>
        </View>

        {/* Avatar + Name */}
        <View className="px-5 mb-5">
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>🏋️</Text>
            </View>

            {editing ? (
              <View className="flex-row items-center gap-2 w-full">
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    color: colors.foreground,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity
                  style={{ backgroundColor: colors.primary, borderRadius: 10, padding: 8 }}
                  onPress={handleSaveName}
                >
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => { setEditName(profile.name); setEditing(true); }}
              >
                <Text className="text-foreground text-xl font-bold">{profile.name}</Text>
                <IconSymbol name="pencil" size={16} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="px-5 mb-5">
          <Text className="text-foreground font-bold text-base mb-3">Estatísticas</Text>
          <View className="flex-row gap-3">
            <View
              style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: 'center' }}
            >
              <Text className="text-foreground text-2xl font-bold">{stats.totalWorkouts}</Text>
              <Text className="text-muted text-xs mt-1">Treinos</Text>
            </View>
            <View
              style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: 'center' }}
            >
              <Text className="text-foreground text-2xl font-bold">{stats.currentStreak}</Text>
              <Text className="text-muted text-xs mt-1">Sequência</Text>
            </View>
            <View
              style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: 'center' }}
            >
              <Text className="text-foreground text-2xl font-bold">{formatVolume(stats.totalVolume)}</Text>
              <Text className="text-muted text-xs mt-1">Volume</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-5 mb-5">
          <Text className="text-foreground font-bold text-base mb-3">Configurações</Text>
          <View
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}
          >
            {/* Unit Toggle */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View
                style={{ backgroundColor: colors.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}
              >
                <IconSymbol name="dumbbell.fill" size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-medium text-sm">Unidade de Peso</Text>
                <Text className="text-muted text-xs mt-0.5">Quilogramas ou Libras</Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: profile.unit === 'kg' ? colors.primary : colors.border,
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
                onPress={handleToggleUnit}
              >
                <Text style={{ color: profile.unit === 'kg' ? '#fff' : colors.foreground, fontWeight: '700', fontSize: 13 }}>
                  {profile.unit === 'kg' ? 'kg' : 'lb'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* About */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <View style={{ backgroundColor: colors.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <IconSymbol name="info.circle" size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-medium text-sm">Sobre o Mílon</Text>
                <Text className="text-muted text-xs mt-0.5">Versão 1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mílon Legend */}
        <View className="px-5">
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 1,
              borderColor: colors.primary + '30',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Text style={{ fontSize: 20 }}>🏛️</Text>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Sobre o Nome</Text>
            </View>
            <Text className="text-foreground text-sm leading-relaxed">
              Mílon de Crotona foi um lendário atleta grego que carregava um bezerro diariamente. À medida que o animal crescia, Mílon ficava mais forte — o princípio da sobrecarga progressiva. Este app segue a mesma filosofia: pequenas evoluções diárias levam a grandes resultados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
