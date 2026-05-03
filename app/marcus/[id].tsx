/**
 * app/marcus/[id].tsx
 *
 * Tela de detalhes de uma rotina do Marcus.
 * Mostra todos os exercícios com técnica, reps e botão de alternar para o alternativo.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
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
  'Tradicional': 'Concêntrica rápida + excêntrica lenta. Pausa autosselecionada 60-120s.',
  'Bi-Set': 'Dois exercícios em sequência sem intervalo. Combinar números iguais.',
  'Circuito': 'Todos os exercícios em sequência sem pausa. Descanso apenas na transição de séries.',
};

export default function MarcusRoutineDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const routine = MARCUS_ROUTINES.find((r) => r.id === id);

  // Track which exercises are showing the alternative version
  // key: index of the MAIN exercise, value: true if showing alternative
  const [showingAlternative, setShowingAlternative] = useState<Record<number, boolean>>({});

  if (!routine) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Treino não encontrado.</Text>
      </ScreenContainer>
    );
  }

  // Build display list: for each main exercise, decide whether to show main or alternative
  const buildDisplayList = (): (ExerciseSlot & { originalIndex: number })[] => {
    const result: (ExerciseSlot & { originalIndex: number })[] = [];

    routine.exercises.forEach((ex, idx) => {
      if (ex.isAlternative) return; // skip alternatives — they'll be shown inline

      const isShowingAlt = showingAlternative[idx];
      if (isShowingAlt) {
        // Find the alternative for this exercise
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

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
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
    backText: {
      fontSize: 18,
      color: colors.foreground,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.foreground,
      flex: 1,
    },
    warmupBox: {
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 8,
      backgroundColor: '#F59E0B20',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: '#F59E0B40',
    },
    warmupLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#F59E0B',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    warmupText: {
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 18,
    },
    startBtn: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 10,
    },
    exCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    exCardAlt: {
      borderColor: '#6B728060',
      borderStyle: 'dashed',
    },
    exCardInner: {
      backgroundColor: colors.surface,
      padding: 14,
    },
    exCardAltInner: {
      backgroundColor: colors.surface + 'CC',
    },
    exRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    exNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    exNumberText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    exNumberAlt: {
      backgroundColor: '#6B728020',
    },
    exNumberAltText: {
      color: '#6B7280',
    },
    exContent: {
      flex: 1,
    },
    exName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
      lineHeight: 20,
    },
    exNameAlt: {
      color: '#9CA3AF',
    },
    altBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
      marginBottom: 4,
    },
    altBadgeText: {
      fontSize: 11,
      color: '#9CA3AF',
      fontStyle: 'italic',
    },
    exMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    metaBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    metaBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    bisetBadge: {
      backgroundColor: '#8B5CF620',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    bisetText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#8B5CF6',
    },
    synergists: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
    toggleBtn: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
    },
    toggleBtnActive: {
      borderColor: '#6B7280',
      backgroundColor: '#6B728015',
    },
    toggleBtnActiveText: {
      color: '#6B7280',
    },
    techDesc: {
      marginTop: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      borderLeftWidth: 3,
    },
    techDescText: {
      fontSize: 12,
      color: colors.muted,
      lineHeight: 17,
    },
  });

  const renderItem = ({
    item,
    index,
  }: {
    item: ExerciseSlot & { originalIndex: number };
    index: number;
  }) => {
    const techColor = TECHNIQUE_COLORS[item.technique] ?? '#6B7280';
    const isAlt = item.isAlternative;
    const canToggle = hasAlternative(item.originalIndex);
    const isShowingAlt = showingAlternative[item.originalIndex];

    return (
      <View style={[styles.exCard, isAlt && styles.exCardAlt]}>
        <View style={[styles.exCardInner, isAlt && styles.exCardAltInner]}>
          <View style={styles.exRow}>
            <View style={[styles.exNumber, isAlt && styles.exNumberAlt]}>
              <Text style={[styles.exNumberText, isAlt && styles.exNumberAltText]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.exContent}>
              {isAlt && (
                <View style={styles.altBadge}>
                  <Text style={styles.altBadgeText}>↩ Alternativo</Text>
                </View>
              )}
              <Text style={[styles.exName, isAlt && styles.exNameAlt]}>
                {item.name}
              </Text>

              {item.synergists.length > 0 && (
                <Text style={styles.synergists}>
                  {item.muscle} • {item.synergists.join(', ')}
                </Text>
              )}

              <View style={styles.exMeta}>
                {/* Séries */}
                <View style={[styles.metaBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.metaBadgeText, { color: colors.primary }]}>
                    {item.sets} séries
                  </Text>
                </View>

                {/* Reps */}
                <View style={[styles.metaBadge, { backgroundColor: colors.foreground + '10' }]}>
                  <Text style={[styles.metaBadgeText, { color: colors.foreground }]}>
                    {item.repsRange} reps
                  </Text>
                </View>

                {/* Técnica */}
                <View style={[styles.metaBadge, { backgroundColor: techColor + '20' }]}>
                  <Text style={[styles.metaBadgeText, { color: techColor }]}>
                    {item.technique}
                  </Text>
                </View>

                {/* Bi-set */}
                {item.bisetGroup !== undefined && (
                  <View style={styles.bisetBadge}>
                    <Text style={styles.bisetText}>Bi-Set {item.bisetGroup}</Text>
                  </View>
                )}
              </View>

              {/* Descrição da técnica */}
              {item.technique !== 'Tradicional' && (
                <View style={[styles.techDesc, { borderLeftColor: techColor }]}>
                  <Text style={styles.techDescText}>
                    {TECHNIQUE_DESCRIPTIONS[item.technique]}
                  </Text>
                </View>
              )}

              {/* Botão de alternar */}
              {canToggle && (
                <TouchableOpacity
                  style={[styles.toggleBtn, isShowingAlt && styles.toggleBtnActive]}
                  onPress={() => toggleAlternative(item.originalIndex)}
                >
                  <Text style={{ fontSize: 14 }}>🔄</Text>
                  <Text
                    style={[
                      styles.toggleBtnText,
                      isShowingAlt && styles.toggleBtnActiveText,
                    ]}
                  >
                    {isShowingAlt ? 'Voltar ao principal' : 'Usar alternativo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{routine.name}</Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>{routine.weekday}</Text>
      </View>

      <View style={styles.warmupBox}>
        <Text style={styles.warmupLabel}>🔥 Aquecimento</Text>
        <Text style={styles.warmupText}>{routine.warmup}</Text>
      </View>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push({ pathname: '/marcus/workout/[id]' as any, params: { id: routine.id } });
        }}
      >
        <Text style={styles.startBtnText}>▶  Iniciar Treino</Text>
      </TouchableOpacity>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id + (item.isAlternative ? '_alt' : '')}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
