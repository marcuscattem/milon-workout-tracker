/**
 * ShareProgressCard
 *
 * Um card visual otimizado para captura como imagem e compartilhamento
 * nas redes sociais. Renderizado fora da tela via ViewShot.
 *
 * Layout: 1:1 (quadrado) para compatibilidade com Instagram/WhatsApp.
 * Inclui: nome do exercício, gráfico de linha, stats principais e branding Mílon.
 */

import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Text as SvgText,
  Rect,
} from 'react-native-svg';

import { LineChartPoint } from './LineChart';
import { ExerciseHistoryPoint } from '@/store/workoutStore';

interface ShareProgressCardProps {
  exerciseName: string;
  muscleLabel: string;
  muscleColor: string;
  chartData: LineChartPoint[];
  metricLabel: string;
  metricUnit: string;
  stats: {
    maxWeight: number;
    best1RM: number;
    weightProgress: number;
    totalSessions: number;
  };
  history: ExerciseHistoryPoint[];
  cardWidth: number;
}

const CARD_PADDING = 24;
const CHART_HEIGHT = 160;

// Minimal inline chart for the share card (no interactivity needed)
function ShareChart({
  data,
  width,
  height,
  color,
  unit,
}: {
  data: LineChartPoint[];
  width: number;
  height: number;
  color: string;
  unit: string;
}) {
  const PAD = { top: 20, right: 12, bottom: 32, left: 44 };
  const cw = width - PAD.left - PAD.right;
  const ch = height - PAD.top - PAD.bottom;

  const { points, pathD, areaD, yTicks, xLabels } = useMemo(() => {
    if (data.length === 0) return { points: [], pathD: '', areaD: '', yTicks: [], xLabels: [] };

    const values = data.map((d) => d.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = rawMax === rawMin ? rawMax * 0.2 || 10 : (rawMax - rawMin) * 0.15;
    const minV = Math.max(0, rawMin - pad);
    const maxV = rawMax + pad;

    const toX = (i: number) =>
      data.length === 1
        ? PAD.left + cw / 2
        : PAD.left + (i / (data.length - 1)) * cw;

    const toY = (v: number) =>
      PAD.top + ch - ((v - minV) / (maxV - minV)) * ch;

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));

    let pathD = '';
    let areaD = '';
    if (pts.length === 1) {
      pathD = `M ${pts[0].x} ${pts[0].y}`;
    } else {
      pathD = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const cp1x = prev.x + (cur.x - prev.x) * 0.4;
        const cp2x = cur.x - (cur.x - prev.x) * 0.4;
        pathD += ` C ${cp1x} ${prev.y}, ${cp2x} ${cur.y}, ${cur.x} ${cur.y}`;
      }
      const bottomY = PAD.top + ch;
      areaD = `${pathD} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
    }

    // 3 y-ticks
    const yTicks = Array.from({ length: 3 }, (_, i) => {
      const val = minV + ((maxV - minV) * i) / 2;
      return { val: Math.round(val), y: toY(val) };
    });

    // x-labels: at most 5
    const step = Math.max(1, Math.ceil(data.length / 5));
    const xLabels = data
      .map((d, i) => ({ label: d.label, x: toX(i) }))
      .filter((_, i) => i % step === 0 || i === data.length - 1);

    return { points: pts, pathD, areaD, yTicks, xLabels };
  }, [data, cw, ch]);

  if (data.length === 0) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Sem dados</Text>
      </View>
    );
  }

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="shareAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.35" />
          <Stop offset="1" stopColor={color} stopOpacity="0.03" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <React.Fragment key={i}>
          <Line
            x1={PAD.left}
            y1={t.y}
            x2={PAD.left + cw}
            y2={t.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <SvgText
            x={PAD.left - 5}
            y={t.y + 4}
            textAnchor="end"
            fontSize="9"
            fill="rgba(255,255,255,0.5)"
          >
            {t.val}
          </SvgText>
        </React.Fragment>
      ))}

      {/* X labels */}
      {xLabels.map((l, i) => (
        <SvgText
          key={i}
          x={l.x}
          y={PAD.top + ch + 16}
          textAnchor="middle"
          fontSize="9"
          fill="rgba(255,255,255,0.5)"
        >
          {l.label}
        </SvgText>
      ))}

      {/* Unit */}
      <SvgText
        x={PAD.left - 5}
        y={PAD.top - 6}
        textAnchor="end"
        fontSize="8"
        fill="rgba(255,255,255,0.4)"
      >
        {unit}
      </SvgText>

      {/* Area */}
      {areaD ? <Path d={areaD} fill="url(#shareAreaGrad)" /> : null}

      {/* Line */}
      {pathD ? (
        <Path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {/* Dots — only for small datasets */}
      {data.length <= 15 &&
        points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill="rgba(20,20,30,0.8)" stroke={color} strokeWidth="2" />
            <Circle cx={p.x} cy={p.y} r={2} fill={color} />
          </React.Fragment>
        ))}
    </Svg>
  );
}

/**
 * O card é renderizado com fundo escuro fixo para garantir
 * boa aparência ao ser compartilhado em qualquer contexto.
 */
export const ShareProgressCard = forwardRef<View, ShareProgressCardProps>(
  (
    {
      exerciseName,
      muscleLabel,
      muscleColor,
      chartData,
      metricLabel,
      metricUnit,
      stats,
      history,
      cardWidth,
    },
    ref
  ) => {
    const cardHeight = cardWidth; // quadrado 1:1
    const chartAreaWidth = cardWidth - CARD_PADDING * 2;

    const progressSign = stats.weightProgress >= 0 ? '+' : '';
    const progressColor = stats.weightProgress >= 0 ? '#4ADE80' : '#F87171';

    const latestVal =
      history.length > 0
        ? history[history.length - 1].maxWeight
        : null;

    return (
      <View
        ref={ref}
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: '#0F1117',
          },
        ]}
        collapsable={false}
      >
        {/* Decorative top accent bar */}
        <View
          style={[
            styles.accentBar,
            { backgroundColor: muscleColor },
          ]}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exerciseName}
            </Text>
            <View
              style={[
                styles.muscleBadge,
                { backgroundColor: muscleColor + '30' },
              ]}
            >
              <Text style={[styles.muscleLabel, { color: muscleColor }]}>
                {muscleLabel}
              </Text>
            </View>
          </View>

          {/* Branding */}
          <View style={styles.branding}>
            <Text style={styles.brandIcon}>🔥</Text>
            <Text style={styles.brandName}>Mílon</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: muscleColor }]}>
              {stats.maxWeight}kg
            </Text>
            <Text style={styles.statLabel}>Peso Máx.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FBBF24' }]}>
              {stats.best1RM}kg
            </Text>
            <Text style={styles.statLabel}>1RM Est.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: progressColor }]}>
              {progressSign}{stats.weightProgress}kg
            </Text>
            <Text style={styles.statLabel}>Evolução</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: 'rgba(255,255,255,0.9)' }]}>
              {stats.totalSessions}
            </Text>
            <Text style={styles.statLabel}>Sessões</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: 'rgba(255,255,255,0.5)' }]}>
            {metricLabel.toUpperCase()} AO LONGO DO TEMPO
          </Text>
          <ShareChart
            data={chartData}
            width={chartAreaWidth}
            height={CHART_HEIGHT}
            color={muscleColor}
            unit={metricUnit}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {history.length > 0
              ? `Último treino: ${new Date(history[history.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : 'Mílon Workout Tracker'}
          </Text>
          <Text style={styles.footerBrand}>milon.app</Text>
        </View>
      </View>
    );
  }
);

ShareProgressCard.displayName = 'ShareProgressCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING + 4,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  muscleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 5,
  },
  muscleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  branding: {
    alignItems: 'center',
    marginLeft: 12,
  },
  brandIcon: {
    fontSize: 20,
  },
  brandName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  chartContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
  },
  footerBrand: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
