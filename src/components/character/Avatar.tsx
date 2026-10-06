import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Character } from '@/models';

export const SKIN_TONES = ['#FCE0C8', '#F1C7A1', '#D9A47A', '#B57A50', '#8A5634', '#5E3A22'] as const;
export const HAIR_COLORS = ['#2B1D14', '#5A3A22', '#8B5A2B', '#C8A165', '#1A1A1A', '#A0522D'] as const;
export const OUTFIT_COLORS = ['#0F7A6E', '#2F5AA8', '#9C3D54', '#6E43AE', '#C8743A', '#3D4A5C'] as const;

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 0xff) + amount);
  const b = clamp((n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface AvatarProps {
  character: Character;
  size?: number;
}

/** The player's own customisable character (never used for prophets or other real persons). */
export function Avatar({ character, size = 160 }: AvatarProps) {
  const skin = SKIN_TONES[character.skinTone] ?? SKIN_TONES[2];
  const hair = HAIR_COLORS[character.hairColor] ?? HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[character.outfitColor] ?? OUTFIT_COLORS[0];
  const outfitDark = shade(outfit, -35);
  const hijab = character.headwear === 'hijab';

  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 200 220">
      {/* Backpack behind the body */}
      {character.accessory === 'backpack' ? <Rect x={44} y={150} width={112} height={70} rx={20} fill="#C8743A" /> : null}

      {/* Long hair behind the head */}
      {!hijab && (character.hairStyle === 'long' || character.hairStyle === 'bun') ? (
        <Path d="M56 92C56 50 144 50 144 92V150C130 160 70 160 56 150Z" fill={hair} />
      ) : null}

      {/* Body / outfit */}
      {renderOutfit(character.outfit, outfit, outfitDark)}

      {/* Neck */}
      {!hijab ? <Rect x={88} y={128} width={24} height={24} rx={8} fill={shade(skin, -15)} /> : null}

      {/* Hijab drape behind the face */}
      {hijab ? <Path d="M48 100C48 40 152 40 152 100V160C140 172 60 172 48 160Z" fill={outfitDark} /> : null}

      {/* Ears */}
      {!hijab ? (
        <>
          <Circle cx={58} cy={98} r={9} fill={skin} />
          <Circle cx={142} cy={98} r={9} fill={skin} />
        </>
      ) : null}

      {/* Head */}
      <Ellipse cx={100} cy={96} rx={hijab ? 36 : 42} ry={hijab ? 40 : 44} fill={skin} />

      {/* Hair on top */}
      {!hijab ? renderHair(character.hairStyle, hair) : null}

      {/* Hijab front */}
      {hijab ? (
        <Path d="M60 98C60 52 140 52 140 98 140 70 120 58 100 58S60 70 60 98Z" fill={outfit} />
      ) : null}

      {/* Face */}
      <G>
        <Ellipse cx={84} cy={100} rx={5} ry={6} fill="#2B1D14" />
        <Ellipse cx={116} cy={100} rx={5} ry={6} fill="#2B1D14" />
        <Circle cx={86} cy={98} r={1.6} fill="#FFFFFF" />
        <Circle cx={118} cy={98} r={1.6} fill="#FFFFFF" />
        <Path d="M76 88q8-5 16 0M108 88q8-5 16 0" stroke={hijab ? '#2B1D14' : hair} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={74} cy={114} r={7} fill="#F28C8C" opacity={0.25} />
        <Circle cx={126} cy={114} r={7} fill="#F28C8C" opacity={0.25} />
        <Path d="M88 118q12 10 24 0" stroke="#7A3B2E" strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>

      {/* Headwear */}
      {character.headwear === 'kufi' ? (
        <>
          <Path d="M64 70C64 44 136 44 136 70Z" fill="#FFFFFF" />
          <Path d="M64 70H136" stroke="#D9D2C3" strokeWidth={3} />
          <Path d="M76 60h48M72 66h56" stroke="#E4DDCF" strokeWidth={1.5} />
        </>
      ) : null}
      {character.headwear === 'cap' ? (
        <>
          <Path d="M58 74C58 40 142 40 142 74Z" fill={outfit} />
          <Path d="M100 72H160C160 80 150 84 140 84H100Z" fill={outfitDark} />
          <Circle cx={100} cy={44} r={4} fill={outfitDark} />
        </>
      ) : null}

      {/* Accessories */}
      {character.accessory === 'glasses' ? (
        <G stroke="#2B2B3A" strokeWidth={3} fill="none">
          <Circle cx={84} cy={100} r={12} />
          <Circle cx={116} cy={100} r={12} />
          <Path d="M96 100h8M72 98l-12-4M128 98l12-4" />
        </G>
      ) : null}
      {character.accessory === 'scarf' ? (
        <>
          <Path d="M70 142C90 156 110 156 130 142L134 156C110 170 90 170 66 156Z" fill="#F2B544" />
          <Rect x={112} y={154} width={16} height={34} rx={5} fill="#E0A12F" />
        </>
      ) : null}
      {character.accessory === 'backpack' ? (
        <G stroke="#8C5E2C" strokeWidth={6} strokeLinecap="round">
          <Path d="M70 158V210M130 158V210" />
        </G>
      ) : null}
      {character.accessory === 'lantern' ? (
        <G>
          <Path d="M170 150V160" stroke="#A86F00" strokeWidth={2} />
          <Circle cx={170} cy={180} r={20} fill="#FFD27A" opacity={0.25} />
          <Path d="M160 162h20l-4 30h-12Z" fill="#F2B544" />
          <Rect x={166} y={170} width={8} height={14} fill="#FFF3C4" />
        </G>
      ) : null}
    </Svg>
  );
}

function renderHair(style: Character['hairStyle'], color: string) {
  switch (style) {
    case 'short':
      return <Path d="M56 98C48 38 152 38 144 98 140 82 124 74 100 76 76 74 60 82 56 98Z" fill={color} />;
    case 'curly':
      return (
        <G fill={color}>
          {[62, 76, 92, 108, 124, 138].map((x, i) => (
            <Circle key={x} cx={x} cy={62 + (i % 2) * 6 - (i > 0 && i < 5 ? 8 : 0)} r={14} />
          ))}
          <Circle cx={58} cy={80} r={10} />
          <Circle cx={142} cy={80} r={10} />
        </G>
      );
    case 'long':
      return <Path d="M54 104C46 38 154 38 146 104 140 84 124 74 100 76 76 74 60 84 54 104Z" fill={color} />;
    case 'buzz':
      return <Path d="M60 84C62 54 138 54 140 84 128 70 112 66 100 66S72 70 60 84Z" fill={color} opacity={0.85} />;
    case 'bun':
      return (
        <G fill={color}>
          <Circle cx={100} cy={42} r={16} />
          <Path d="M56 98C48 40 152 40 144 98 140 82 124 74 100 76 76 74 60 82 56 98Z" />
        </G>
      );
  }
}

function renderOutfit(outfit: Character['outfit'], color: string, dark: string) {
  switch (outfit) {
    case 'thobe':
      return (
        <G>
          <Path d="M40 220C40 170 66 148 100 148S160 170 160 220Z" fill="#F5F1E8" />
          <Path d="M92 148H108L104 186H96Z" fill={color} />
          <Path d="M88 148C92 158 108 158 112 148" stroke="#D9D2C3" strokeWidth={3} fill="none" />
        </G>
      );
    case 'hoodie':
      return (
        <G>
          <Path d="M40 220C40 170 66 146 100 146S160 170 160 220Z" fill={color} />
          <Path d="M72 150C80 166 120 166 128 150" stroke={dark} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Path d="M92 162V190M108 162V190" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
          <Rect x={76} y={196} width={48} height={18} rx={8} fill={dark} />
        </G>
      );
    case 'jacket':
      return (
        <G>
          <Path d="M40 220C40 170 66 148 100 148S160 170 160 220Z" fill={color} />
          <Path d="M100 150 86 220H114Z" fill="#FFFFFF" />
          <Path d="M86 150 100 178 80 168ZM114 150 100 178 120 168Z" fill={dark} />
          <Circle cx={92} cy={198} r={3} fill={dark} />
          <Circle cx={92} cy={210} r={3} fill={dark} />
        </G>
      );
    case 'abaya':
      return (
        <G>
          <Path d="M34 220C38 168 66 146 100 146S162 168 166 220Z" fill={color} />
          <Path d="M100 150V220" stroke={dark} strokeWidth={3} />
          <Path d="M70 150C80 160 120 160 130 150" stroke="#F2B544" strokeWidth={3} fill="none" />
        </G>
      );
  }
}
