/**
 * app/marcus/index.tsx
 *
 * Tela de listagem dos treinos do Marcus Cattem.
 * Mostra os 7 treinos semanais + Pliometria + Argolas.
 * Destaca o treino do dia atual.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MARCUS_ROUTINES, MarcusRoutine } from '@/data/marcus_routines';

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const TECHNIQUE_COLORS: Record<string, string> = {
  'Cluster-Set': '#F59E0B',
  'Isometria': '#3B82F6',
  'Rest-Pause': '#EF4444',
  'Repetições parciais': '#EF4444',
  'Tradicional': '#6B7280',
  'Bi-Set': '#8B5CF6',
  'Circuito': '#10B981',
};

function getTodayRoutineId(): string | null {
  const today = new Date().getDay(); // 0=Dom, 1=Seg...
  const map: Record<number, string> = {
    1: 'marcus_A',
    2: 'marcus_B',
    3: 'marcus_C',
    4: 'marcus_D',
    5: 'marcus_E',
    6: 'marcus_F',
    0: 'marcus_G',
  };
  return map[today] ?? null;
}

function getRoutineColor(id: string): string {
  const colors: Record<string, string> = {
    marcus_A: '#F97316',
    marcus_B: '#3B82F6',
    marcus_C: '#10B981',
    marcus_D: '#8B5CF6',
    marcus_E: '#EF4444',
    marcus_F: '#F59E0B',
    marcus_G: '#EC4899',
    marcus_plio: '#06B6D4',
    marcus_argolas: '#84CC16',
  };
  return colors[id] ?? '#6B7280';
}

export default function MarcusRoutinesScreen() {
  const colors = useColors();
  const router = useRouter();
  const todayId = getTodayRoutineId();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 4,
    },
    todayBanner: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.primary + '20',
      borderWidth: 1.5,
      borderColor: colors.primary + '60',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    todayDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    todayText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 12,
    },
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardInner: {
      backgroundColor: colors.surface,
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    colorDot: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorDotText: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    cardTitleArea: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.foreground,
    },
    cardWeekday: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    todayBadge: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    todayBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    exerciseCount: {
      fontSize: 13,
      color: colors.muted,
      marginBottom: 10,
    },
    techniquesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    techBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    techBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    startBtn: {
      marginTop: 12,
      borderRadius: 10,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  const renderItem = ({ item }: { item: MarcusRoutine }) => {
    const color = getRoutineColor(item.id);
    const isToday = item.id === todayId;
    const mainExercises = item.exercises.filter((e) => !e.isAlternative);
    const techniques = [...new Set(mainExercises.map((e) => e.technique))];

    return (
      <TouchableOpacity
        style={[styles.card, isToday && { borderColor: color, borderWidth: 2 }]}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          router.push({ pathname: '/marcus/[id]' as any, params: { id: item.id } });
        }}
        activeOpacity={0.85}
      >
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={[styles.colorDot, { backgroundColor: color }]}>
              <Text style={styles.colorDotText}>{item.name.replace('Treino ', '')}</Text>
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardWeekday}>{item.weekday}</Text>
            </View>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>HOJE</Text>
              </View>
            )}
          </View>

          <Text style={styles.exerciseCount}>
            {mainExercises.length} exercícios principais •{' '}
            {item.exercises.filter((e) => e.isAlternative).length} alternativos
          </Text>

          <View style={styles.techniquesRow}>
            {techniques.map((t) => (
              <View
                key={t}
                style={[
                  styles.techBadge,
                  { backgroundColor: (TECHNIQUE_COLORS[t] ?? '#6B7280') + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.techBadgeText,
                    { color: TECHNIQUE_COLORS[t] ?? '#6B7280' },
                  ]}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: color }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push({ pathname: '/marcus/workout/[id]' as any, params: { id: item.id } });
            }}
          >
            <Text style={styles.startBtnText}>▶  Iniciar Treino</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Treinos</Text>
        <Text style={styles.subtitle}>Corpo.Ciência • Prof. Dr. Leonardo Carvalho</Text>
      </View>

      {todayId && (
        <View style={styles.todayBanner}>
          <View style={styles.todayDot} />
          <Text style={styles.todayText}>
            Hoje é {WEEKDAY_NAMES[new Date().getDay()]} — {MARCUS_ROUTINES.find((r) => r.id === todayId)?.name}
          </Text>
        </View>
      )}

      <FlatList
        data={MARCUS_ROUTINES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
