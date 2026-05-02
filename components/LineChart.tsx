import React, { useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';

export interface LineChartPoint {
  label: string;   // x-axis label (e.g. "02/05")
  value: number;   // y-axis value
}

interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  width: number;
  color?: string;
  unit?: string;
  showDots?: boolean;
  showArea?: boolean;
  emptyMessage?: string;
}

const PADDING = { top: 24, right: 16, bottom: 40, left: 48 };

export function LineChart({
  data,
  height = 200,
  width,
  color,
  unit = 'kg',
  showDots = true,
  showArea = true,
  emptyMessage = 'Nenhum dado ainda',
}: LineChartProps) {
  const colors = useColors();
  const lineColor = color || colors.primary;

  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { minVal, maxVal, points, pathD, areaD } = useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 1, points: [], pathD: '', areaD: '' };

    const values = data.map((d) => d.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = rawMax === rawMin ? rawMax * 0.2 || 10 : (rawMax - rawMin) * 0.15;
    const minVal = Math.max(0, rawMin - padding);
    const maxVal = rawMax + padding;

    const toX = (i: number) =>
      data.length === 1
        ? PADDING.left + chartWidth / 2
        : PADDING.left + (i / (data.length - 1)) * chartWidth;

    const toY = (v: number) =>
      PADDING.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));

    // Smooth bezier path
    let pathD = '';
    let areaD = '';
    if (pts.length === 1) {
      pathD = `M ${pts[0].x} ${pts[0].y}`;
      areaD = '';
    } else {
      const cp = pts.map((p, i) => {
        if (i === 0) return { cp1x: p.x, cp1y: p.y, cp2x: p.x, cp2y: p.y };
        const prev = pts[i - 1];
        const cp1x = prev.x + (p.x - prev.x) * 0.4;
        const cp1y = prev.y;
        const cp2x = p.x - (p.x - prev.x) * 0.4;
        const cp2y = p.y;
        return { cp1x, cp1y, cp2x, cp2y };
      });

      pathD = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        pathD += ` C ${cp[i].cp1x} ${cp[i].cp1y}, ${cp[i].cp2x} ${cp[i].cp2y}, ${pts[i].x} ${pts[i].y}`;
      }

      const bottomY = PADDING.top + chartHeight;
      areaD = `${pathD} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
    }

    return { minVal, maxVal, points: pts, pathD, areaD };
  }, [data, chartWidth, chartHeight]);

  if (data.length === 0) {
    return (
      <View style={{ height, width, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>{emptyMessage}</Text>
      </View>
    );
  }

  // Y-axis labels (4 ticks)
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) * i) / 3;
    const y = PADDING.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { val: Math.round(val), y };
  });

  // X-axis labels: show at most 6 evenly spaced
  const xStep = Math.max(1, Math.ceil(data.length / 6));
  const xLabels = data
    .map((d, i) => ({ label: d.label, i }))
    .filter((_, i) => i % xStep === 0 || i === data.length - 1);

  const toX = (i: number) =>
    data.length === 1
      ? PADDING.left + chartWidth / 2
      : PADDING.left + (i / (data.length - 1)) * chartWidth;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={lineColor} stopOpacity="0.25" />
          <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <React.Fragment key={i}>
          <Line
            x1={PADDING.left}
            y1={t.y}
            x2={PADDING.left + chartWidth}
            y2={t.y}
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <SvgText
            x={PADDING.left - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize="10"
            fill={colors.muted}
          >
            {t.val}
          </SvgText>
        </React.Fragment>
      ))}

      {/* X-axis labels */}
      {xLabels.map(({ label, i }) => (
        <SvgText
          key={i}
          x={toX(i)}
          y={PADDING.top + chartHeight + 16}
          textAnchor="middle"
          fontSize="10"
          fill={colors.muted}
        >
          {label}
        </SvgText>
      ))}

      {/* Unit label */}
      <SvgText
        x={PADDING.left - 6}
        y={PADDING.top - 8}
        textAnchor="end"
        fontSize="9"
        fill={colors.muted}
      >
        {unit}
      </SvgText>

      {/* Area fill */}
      {showArea && areaD ? (
        <Path d={areaD} fill="url(#areaGrad)" />
      ) : null}

      {/* Line */}
      {pathD ? (
        <Path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={5} fill={colors.background} stroke={lineColor} strokeWidth="2.5" />
            <Circle cx={p.x} cy={p.y} r={2.5} fill={lineColor} />
          </React.Fragment>
        ))}
    </Svg>
  );
}
