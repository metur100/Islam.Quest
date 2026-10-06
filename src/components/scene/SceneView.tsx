import React, { useId } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { SceneElement, SceneSpec, SkyKind } from '@/models';

const SKIES: Record<SkyKind, [string, string]> = {
  night: ['#0E1030', '#2C3274'],
  dawn: ['#2E3A78', '#F2A07B'],
  day: ['#6FBFE0', '#DDF2F8'],
  sunset: ['#4B2C6B', '#F28C5B'],
  dusk: ['#1B1F4B', '#7B5CA6'],
  storm: ['#29313D', '#5E6B78'],
  sea: ['#0B2A4A', '#1E6A8C'],
};

/** Draw order: sky effects → far landscape → ground → objects → overlays. */
const LAYER: Record<SceneElement, number> = {
  stars: 0,
  crescent: 1,
  fullMoon: 1,
  sun: 1,
  clouds: 2,
  mountains: 3,
  hills: 4,
  cave: 4,
  city: 5,
  dunes: 6,
  sea: 6,
  river: 7,
  partedSea: 7,
  garden: 8,
  mosque: 9,
  kaaba: 9,
  palms: 10,
  tree: 10,
  well: 10,
  ark: 10,
  whale: 10,
  fire: 11,
  caravan: 11,
  book: 11,
  basket: 11,
  grain: 11,
  dates: 11,
  prayerMat: 11,
  waves: 12,
  rain: 13,
  lanterns: 14,
  pattern: 15,
};

const isDark = (sky: SkyKind) => sky === 'night' || sky === 'dusk' || sky === 'storm' || sky === 'sea';

interface SceneViewProps {
  scene: SceneSpec;
  height?: number;
  style?: ViewStyle;
  rounded?: boolean;
}

/**
 * Symbolic illustration built from landscape and object layers.
 * By design it never draws people – prophets are represented only through places and objects.
 */
export function SceneView({ scene, height = 200, style, rounded = true }: SceneViewProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const [top, bottom] = SKIES[scene.sky];
  const dark = isDark(scene.sky);
  const elements = [...scene.elements].sort((a, b) => LAYER[a] - LAYER[b]);

  return (
    <View
      style={[styles.root, { height, borderRadius: rounded ? 22 : 0 }, style]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
          <LinearGradient id={`glow${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE9A8" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={220} fill={`url(#sky${id})`} />
        {elements.map((el) => (
          <G key={el}>{renderElement(el, dark, id)}</G>
        ))}
      </Svg>
    </View>
  );
}

const STAR_POINTS: [number, number, number][] = [
  [30, 25, 1.6], [70, 50, 1.1], [110, 18, 1.4], [150, 40, 1], [190, 22, 1.7], [230, 55, 1.1],
  [262, 16, 1.3], [300, 70, 1], [345, 30, 1.5], [380, 58, 1.2], [55, 85, 1], [205, 80, 1.2],
  [128, 72, 0.9], [330, 95, 1], [15, 60, 1.1], [365, 12, 1],
];

function renderElement(el: SceneElement, dark: boolean, id: string): React.ReactNode {
  switch (el) {
    case 'stars':
      return STAR_POINTS.map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.85} />);
    case 'crescent':
      return (
        <>
          <Circle cx={320} cy={48} r={34} fill={`url(#glow${id})`} opacity={0.35} />
          <Path d="M318 22a26 26 0 1 0 22 40 21 21 0 1 1-22-40z" fill="#F7D774" />
        </>
      );
    case 'fullMoon':
      return (
        <>
          <Circle cx={318} cy={50} r={36} fill="#FFF3C4" opacity={0.25} />
          <Circle cx={318} cy={50} r={22} fill="#FFF3C4" />
          <Circle cx={311} cy={45} r={4} fill="#EBDDA6" />
          <Circle cx={325} cy={56} r={3} fill="#EBDDA6" />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={310} cy={60} r={44} fill="#FFD27A" opacity={0.3} />
          <Circle cx={310} cy={60} r={26} fill="#FFC857" />
        </>
      );
    case 'clouds':
      return (
        <G fill="#FFFFFF" opacity={dark ? 0.25 : 0.85}>
          <Ellipse cx={90} cy={50} rx={38} ry={13} />
          <Ellipse cx={115} cy={42} rx={24} ry={12} />
          <Ellipse cx={240} cy={34} rx={32} ry={10} />
          <Ellipse cx={258} cy={28} rx={18} ry={9} />
        </G>
      );
    case 'rain':
      return (
        <G stroke="#C7D6E6" strokeWidth={1.5} opacity={0.6}>
          {Array.from({ length: 26 }, (_, i) => {
            const x = (i * 37) % 410;
            const y = (i * 53) % 160;
            return <Path key={i} d={`M${x} ${y}l-6 16`} />;
          })}
        </G>
      );
    case 'mountains':
      return (
        <>
          <Path d="M0 160 70 80 120 130 180 60 250 140 310 85 400 150V220H0Z" fill={dark ? '#252A5C' : '#7C8BA6'} />
          <Path d="M180 60 196 80 186 78 178 88 170 76Z" fill="#FFFFFF" opacity={dark ? 0.3 : 0.7} />
          <Path d="M0 180 90 120 160 170 240 115 330 165 400 135V220H0Z" fill={dark ? '#1A1E47' : '#5E6F8C'} />
        </>
      );
    case 'hills':
      return (
        <>
          <Path d="M0 170C60 140 120 150 190 165S320 140 400 160V220H0Z" fill={dark ? '#1E3B3A' : '#8FBF7A'} />
          <Path d="M0 190C80 170 160 180 240 192S350 175 400 185V220H0Z" fill={dark ? '#163030' : '#6FA866'} />
        </>
      );
    case 'cave':
      return (
        <>
          <Path d="M120 220 210 70 300 220Z" fill={dark ? '#2A2550' : '#8C7A6B'} />
          <Path d="M195 220c0-30 6-55 18-55s18 25 18 55Z" fill="#0B0A1A" />
          <Circle cx={213} cy={185} r={14} fill="#FFE9A8" opacity={0.18} />
        </>
      );
    case 'city':
      return (
        <G fill={dark ? '#20244F' : '#C9A77C'}>
          <Rect x={20} y={150} width={40} height={50} />
          <Rect x={62} y={135} width={30} height={65} />
          <Rect x={95} y={155} width={46} height={45} />
          <Rect x={280} y={145} width={36} height={55} />
          <Rect x={318} y={160} width={50} height={40} />
          <Rect x={370} y={140} width={30} height={60} />
          <G fill={dark ? '#FFD27A' : '#8C6A44'} opacity={dark ? 0.8 : 0.5}>
            <Rect x={30} y={162} width={6} height={8} />
            <Rect x={72} y={150} width={6} height={8} />
            <Rect x={110} y={168} width={6} height={8} />
            <Rect x={292} y={158} width={6} height={8} />
            <Rect x={335} y={172} width={6} height={8} />
          </G>
        </G>
      );
    case 'dunes':
      return (
        <>
          <Path d="M0 175C80 150 150 160 230 178S350 160 400 170V220H0Z" fill={dark ? '#5B4A6E' : '#E9C38A'} />
          <Path d="M0 195C90 180 170 188 260 200S360 190 400 195V220H0Z" fill={dark ? '#4A3C5C' : '#DDAE6C'} />
        </>
      );
    case 'sea':
      return (
        <>
          <Rect x={0} y={165} width={400} height={55} fill={dark ? '#173E66' : '#3C8DBC'} />
          <Path d="M0 172q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={2} fill="none" />
        </>
      );
    case 'river':
      return <Path d="M0 200C90 185 150 205 230 190S350 180 400 195V212C340 200 300 210 230 206S90 200 0 214Z" fill="#4FA3D1" opacity={0.85} />;
    case 'partedSea':
      return (
        <>
          <Path d="M0 90C60 95 120 100 160 110L170 220H0Z" fill="#1E5C8C" />
          <Path d="M400 90C340 95 280 100 240 110L230 220H400Z" fill="#1E5C8C" />
          <Path d="M0 100C50 104 110 108 158 116M400 100C350 104 290 108 242 116" stroke="#A9D6F5" strokeWidth={3} fill="none" opacity={0.7} />
          <Path d="M170 220 160 110H240L230 220Z" fill="#D9B98A" />
          <Path d="M195 115 192 220M207 115 210 220" stroke="#C4A272" strokeWidth={1.5} strokeDasharray="4 6" />
        </>
      );
    case 'garden':
      return (
        <>
          <Ellipse cx={60} cy={200} rx={50} ry={22} fill="#4E9A5B" />
          <Ellipse cx={340} cy={202} rx={56} ry={20} fill="#4E9A5B" />
          <Ellipse cx={200} cy={210} rx={70} ry={16} fill="#5DAA67" />
          {[40, 75, 320, 352, 180, 222].map((x, i) => (
            <G key={x}>
              <Circle cx={x} cy={190 + (i % 2) * 6} r={4} fill={i % 2 ? '#F7A1B5' : '#FFFFFF'} />
              <Circle cx={x} cy={190 + (i % 2) * 6} r={1.5} fill="#F2B544" />
            </G>
          ))}
        </>
      );
    case 'tree':
      return (
        <>
          <Rect x={93} y={140} width={12} height={60} rx={4} fill="#7A5230" />
          <Circle cx={99} cy={125} r={34} fill={dark ? '#2F6B4C' : '#5AA668'} />
          <Circle cx={78} cy={140} r={20} fill={dark ? '#285E43' : '#4E9A5B'} />
          <Circle cx={120} cy={138} r={22} fill={dark ? '#285E43' : '#4E9A5B'} />
        </>
      );
    case 'palms':
      return (
        <>
          {[
            [60, 200, 1],
            [355, 205, 0.85],
          ].map(([x, y, s]) => (
            <G key={x} transform={`translate(${x} ${y}) scale(${s})`}>
              <Path d="M-3 0C-1-30 2-60 8-90L13-90C7-60 4-30 3 0Z" fill="#7A5230" />
              <Path d="M10-90C-10-100-30-95-40-82 -20-90 0-88 10-90Z" fill="#3E8A55" />
              <Path d="M10-90C30-102 50-96 60-82 40-90 20-88 10-90Z" fill="#3E8A55" />
              <Path d="M10-90C0-110-15-118-30-118-10-108 0-100 10-90Z" fill="#4E9A5B" />
              <Path d="M10-90C20-112 35-118 50-116 32-106 20-100 10-90Z" fill="#4E9A5B" />
            </G>
          ))}
        </>
      );
    case 'mosque':
      return (
        <G fill={dark ? '#0C0E26' : '#2F3B66'}>
          <Rect x={150} y={150} width={100} height={60} />
          <Path d="M160 150C160 110 240 110 240 150Z" />
          <Rect x={197} y={98} width={6} height={16} />
          <Path d="M200 88a6 6 0 1 0 4 10 5 5 0 1 1-4-10z" fill="#F7D774" />
          <Rect x={125} y={110} width={14} height={100} />
          <Path d="M125 110 132 92 139 110Z" />
          <Rect x={261} y={110} width={14} height={100} />
          <Path d="M261 110 268 92 275 110Z" />
          <Path d="M190 210v-26a10 10 0 0 1 20 0v26Z" fill={dark ? '#FFD27A' : '#F2B544'} opacity={dark ? 0.9 : 0.8} />
        </G>
      );
    case 'kaaba':
      return (
        <>
          <Path d="M150 210V140L200 125 250 140V210Z" fill="#141414" />
          <Path d="M200 125V210" stroke="#2A2A2A" strokeWidth={1} />
          <Path d="M150 152 200 138 250 152V160L200 146 150 160Z" fill="#D4A437" />
          <Ellipse cx={200} cy={212} rx={110} ry={10} fill="#E8E1D1" opacity={0.6} />
        </>
      );
    case 'ark':
      return (
        <>
          <Path d="M110 165H290L270 195H130Z" fill="#8A5A34" />
          <Path d="M110 165H290" stroke="#6B4425" strokeWidth={3} />
          <Rect x={160} y={135} width={80} height={30} fill="#A06C40" />
          <Path d="M150 135H250L200 115Z" fill="#6B4425" />
          <Rect x={175} y={145} width={10} height={10} fill="#3B2615" />
          <Rect x={215} y={145} width={10} height={10} fill="#3B2615" />
        </>
      );
    case 'waves':
      return (
        <G fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2.5}>
          <Path d="M0 190q20-12 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" />
          <Path d="M-20 205q20-12 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" />
        </G>
      );
    case 'fire':
      return (
        <>
          <Ellipse cx={200} cy={205} rx={70} ry={10} fill="#3A1D10" opacity={0.6} />
          <Path d="M200 205c-40 0-55-25-40-55 5 15 15 20 20 20-5-25 5-50 25-65 0 25 15 35 25 50 10 15 20 30 5 45-8 5-20 5-35 5z" fill="#F28C28" />
          <Path d="M200 205c-20 0-28-14-20-30 4 8 9 10 12 10-2-14 4-26 14-34 0 14 8 20 13 28 5 9 4 18-4 22-4 3-9 4-15 4z" fill="#FFD27A" />
          <Circle cx={200} cy={150} r={70} fill="#7EC8E3" opacity={0.14} />
        </>
      );
    case 'well':
      return (
        <>
          <Path d="M165 210V170H235V210Z" fill="#9C8B78" />
          <Path d="M165 180H235M165 195H235M185 170V210M215 170V210" stroke="#7D6E5E" strokeWidth={1.5} />
          <Ellipse cx={200} cy={170} rx={35} ry={7} fill="#2C2620" />
          <Path d="M170 170V130M230 170V130M165 130H235" stroke="#6B4425" strokeWidth={5} />
          <Path d="M200 130V155" stroke="#BFA27A" strokeWidth={2} />
        </>
      );
    case 'whale':
      return (
        <>
          <Path d="M90 150C120 100 260 95 310 140 330 125 350 115 365 118 355 135 350 150 365 168 345 168 325 160 310 152 270 195 130 200 90 150Z" fill="#2F4F6F" />
          <Path d="M100 158C150 185 250 185 300 155" stroke="#5F87A8" strokeWidth={3} fill="none" />
          <Circle cx={140} cy={140} r={4} fill="#0C1A26" />
          {[150, 170, 190].map((y, i) => (
            <Circle key={y} cx={60 + i * 12} cy={y - 40} r={3 + i} fill="#FFFFFF" opacity={0.35} />
          ))}
        </>
      );
    case 'book':
      return (
        <>
          <Circle cx={200} cy={150} r={60} fill="#FFE9A8" opacity={0.2} />
          <Path d="M130 175C155 165 180 165 200 178 220 165 245 165 270 175V125C245 115 220 115 200 128 180 115 155 115 130 125Z" fill="#FDF6E3" />
          <Path d="M200 128V178" stroke="#C9A35A" strokeWidth={2} />
          <Path d="M130 175C155 165 180 165 200 178 220 165 245 165 270 175V182C245 172 220 172 200 185 180 172 155 172 130 182Z" fill="#2E7D5B" />
          <G stroke="#C9A35A" strokeWidth={1.5} opacity={0.6}>
            <Path d="M145 135h40M145 145h40M145 155h35M215 135h40M215 145h40M220 155h35" />
          </G>
        </>
      );
    case 'caravan':
      return (
        <G fill={dark ? '#1A1530' : '#6B4A2E'}>
          {[110, 175, 240].map((x) => (
            <G key={x} transform={`translate(${x} 182)`}>
              <Path d="M0 0C5-14 22-16 30-6 34-14 42-14 46-6L52-18 58-16 54 2 50 18H46L44 6H14L10 18H6L4 6C0 4 0 2 0 0Z" />
            </G>
          ))}
        </G>
      );
    case 'basket':
      return (
        <>
          <Path d="M170 190C170 210 230 210 230 190Z" fill="#B07A3E" />
          <Path d="M168 190H232" stroke="#8C5E2C" strokeWidth={4} />
          <Path d="M178 196h44M182 202h36" stroke="#8C5E2C" strokeWidth={1.5} />
          <Circle cx={190} cy={185} r={7} fill="#E46B4F" />
          <Circle cx={205} cy={183} r={7} fill="#F2B544" />
          <Circle cx={218} cy={186} r={6} fill="#6DB36D" />
        </>
      );
    case 'grain':
      return (
        <G stroke="#C9A04A" strokeWidth={2.5} fill="#E3BC5E">
          {[140, 160, 240, 260, 280].map((x, i) => (
            <G key={x}>
              <Path d={`M${x} 215V${150 + (i % 2) * 10}`} fill="none" />
              <Ellipse cx={x} cy={148 + (i % 2) * 10} rx={4} ry={10} />
            </G>
          ))}
        </G>
      );
    case 'dates':
      return (
        <G>
          {[
            [185, 190], [196, 196], [207, 190], [190, 202], [203, 203], [215, 198],
          ].map(([x, y]) => (
            <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={6} ry={9} fill="#7A3B1F" />
          ))}
        </G>
      );
    case 'prayerMat':
      return (
        <G transform="translate(-118 0)">
          <Path d="M150 212 170 160H230L250 212Z" fill="#9C3D54" />
          <Path d="M158 206 174 166H226L242 206Z" fill="none" stroke="#F2B544" strokeWidth={2} />
          <Path d="M188 180a12 12 0 0 1 24 0v10h-24Z" fill="none" stroke="#F2B544" strokeWidth={2} />
        </G>
      );
    case 'lanterns':
      return (
        <>
          {[48, 118, 236].map((x, i) => {
            const drop = 30 + (i % 2) * 18;
            return (
              <G key={x}>
                <Path d={`M${x} 0V${drop}`} stroke="#C9A35A" strokeWidth={1.2} />
                <Circle cx={x} cy={drop + 14} r={16} fill="#FFD27A" opacity={0.18} />
                <Path d={`M${x - 8} ${drop + 4}h16l-3 22h-10Z`} fill="#F2B544" />
                <Path d={`M${x - 5} ${drop}h10l-2 4h-6Z`} fill="#A86F00" />
                <Rect x={x - 3} y={drop + 9} width={6} height={10} fill="#FFF3C4" opacity={0.9} />
              </G>
            );
          })}
        </>
      );
    case 'pattern':
      return (
        <G opacity={0.08} stroke="#FFFFFF" fill="none" strokeWidth={1.2}>
          {Array.from({ length: 8 }, (_, i) => (
            <Path
              key={i}
              d={`M${i * 56 + 28} 6 ${i * 56 + 34} 22 ${i * 56 + 50} 28 ${i * 56 + 34} 34 ${i * 56 + 28} 50 ${i * 56 + 22} 34 ${i * 56 + 6} 28 ${i * 56 + 22} 22Z`}
            />
          ))}
        </G>
      );
  }
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden' },
});
