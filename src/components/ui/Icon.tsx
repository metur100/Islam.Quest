import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'map'
  | 'book'
  | 'user'
  | 'flame'
  | 'star'
  | 'starOutline'
  | 'lock'
  | 'check'
  | 'close'
  | 'back'
  | 'chevron'
  | 'settings'
  | 'speaker'
  | 'play'
  | 'stop'
  | 'refresh'
  | 'trophy'
  | 'sparkle'
  | 'moon'
  | 'sun'
  | 'mosque'
  | 'scroll'
  | 'quran'
  | 'heart'
  | 'letter'
  | 'flag'
  | 'calendar'
  | 'eye'
  | 'eyeOff'
  | 'info'
  | 'shield'
  | 'bell'
  | 'lantern'
  | 'globe'
  | 'trash'
  | 'pencil';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Hand-drawn line icon set (24×24 grid) so the app ships without icon fonts. */
export function Icon({ name, size = 24, color = '#1D1F33', strokeWidth = 2 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const filled = { fill: color, stroke: 'none' };

  const body = (() => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path d="M3 11.5 12 4l9 7.5" {...common} />
            <Path d="M5.5 10v9.5h5v-5h3v5h5V10" {...common} />
          </>
        );
      case 'map':
        return (
          <>
            <Path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20z" {...common} />
            <Path d="M8.5 4v13.5M15.5 6.5V20" {...common} />
          </>
        );
      case 'book':
        return (
          <>
            <Path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" {...common} />
            <Path d="M12 6v13" {...common} />
          </>
        );
      case 'user':
        return (
          <>
            <Circle cx={12} cy={8} r={4} {...common} />
            <Path d="M4.5 20c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" {...common} />
          </>
        );
      case 'flame':
        return (
          <Path
            d="M12 21c-4 0-6.5-2.6-6.5-6.1 0-3.4 2.6-5.3 3.6-8.4.4 2 1.6 3 2.6 3.5.2-2.8 1.6-5 3.7-7 .3 3.1 1.6 4.8 2.7 6.4 1 1.4 1.4 2.7 1.4 4.6C19.5 18.3 16.5 21 12 21z"
            {...filled}
          />
        );
      case 'star':
        return <Path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" {...filled} />;
      case 'starOutline':
        return <Path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" {...common} />;
      case 'lock':
        return (
          <>
            <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...common} />
            <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...common} />
          </>
        );
      case 'check':
        return <Path d="m5 12.5 4.5 4.5L19 7.5" {...common} />;
      case 'close':
        return <Path d="M6 6l12 12M18 6 6 18" {...common} />;
      case 'back':
        return <Path d="M15 5 8 12l7 7" {...common} />;
      case 'chevron':
        return <Path d="m9 5 7 7-7 7" {...common} />;
      case 'settings':
        return (
          <>
            <Circle cx={12} cy={12} r={3} {...common} />
            <Path
              d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"
              {...common}
            />
          </>
        );
      case 'speaker':
        return (
          <>
            <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...common} />
            <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...common} />
          </>
        );
      case 'play':
        return <Path d="M7 4.5v15l12.5-7.5z" {...filled} />;
      case 'stop':
        return <Rect x={6} y={6} width={12} height={12} rx={2} {...filled} />;
      case 'refresh':
        return (
          <>
            <Path d="M19.5 11A7.5 7.5 0 0 0 6 6.6L4.5 8" {...common} />
            <Path d="M4.5 3.5V8H9" {...common} />
            <Path d="M4.5 13A7.5 7.5 0 0 0 18 17.4l1.5-1.4" {...common} />
            <Path d="M19.5 20.5V16H15" {...common} />
          </>
        );
      case 'trophy':
        return (
          <>
            <Path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" {...common} />
            <Path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5" {...common} />
          </>
        );
      case 'sparkle':
        return (
          <Path
            d="M12 3c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6zM18.5 15c.3 1.8.9 2.4 2.5 2.7-1.6.3-2.2.9-2.5 2.7-.3-1.8-.9-2.4-2.5-2.7 1.6-.3 2.2-.9 2.5-2.7z"
            {...filled}
          />
        );
      case 'moon':
        return <Path d="M19.5 15.5A8 8 0 0 1 8.5 4.5a8 8 0 1 0 11 11z" {...filled} />;
      case 'sun':
        return (
          <>
            <Circle cx={12} cy={12} r={4} {...filled} />
            <Path
              d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
              {...common}
            />
          </>
        );
      case 'mosque':
        return (
          <>
            <Path d="M6 20.5v-6.5c0-3.3 2.7-5.5 6-7.5 3.3 2 6 4.2 6 7.5v6.5z" {...common} />
            <Path d="M12 6.5V3.5M10.5 20.5v-4a1.5 1.5 0 0 1 3 0v4M3 20.5V11M21 20.5V11M2 20.5h20" {...common} />
          </>
        );
      case 'scroll':
        return (
          <>
            <Path d="M7 4h11a2 2 0 0 1 2 2v1.5h-4" {...common} />
            <Path d="M16 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5h10" {...common} />
            <Path d="M7 4a2 2 0 0 0-2 2v10.5M8.5 9h4.5M8.5 12.5h4.5" {...common} />
          </>
        );
      case 'quran':
        return (
          <>
            <Path d="M5 4h11.5A2.5 2.5 0 0 1 19 6.5V20H7.5A2.5 2.5 0 0 1 5 17.5z" {...common} />
            <Path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H19" {...common} />
            <Path d="m12 6.5 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 8.8l2-.3z" {...filled} />
          </>
        );
      case 'heart':
        return (
          <Path
            d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"
            {...filled}
          />
        );
      case 'letter':
        return (
          <>
            <Path d="M16 6.5c-1.3-1.3-3.8-1.2-4.6.6-.8 1.9.8 3.4 3 3.4H9.5c-2.2 0-3.5 1.6-3.5 3.6C6 16.4 8 18 11 18h7" {...common} />
            <Circle cx={12} cy={21} r={1} {...filled} />
          </>
        );
      case 'flag':
        return (
          <>
            <Path d="M5 21V4" {...common} />
            <Path d="M5 4.5c4-2 7 2 11 0v8c-4 2-7-2-11 0" {...common} />
          </>
        );
      case 'calendar':
        return (
          <>
            <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} {...common} />
            <Path d="M3.5 10h17M8 3v4M16 3v4" {...common} />
          </>
        );
      case 'eye':
        return (
          <>
            <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...common} />
            <Circle cx={12} cy={12} r={3} {...common} />
          </>
        );
      case 'eyeOff':
        return (
          <>
            <Path d="M4 4l16 16" {...common} />
            <Path d="M10 6c.6-.3 1.3-.5 2-.5 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.5 7.5A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" {...common} />
          </>
        );
      case 'info':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M12 11v6M12 7.5v.5" {...common} />
          </>
        );
      case 'shield':
        return (
          <>
            <Path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z" {...common} />
            <Path d="m9 12 2 2 4-4" {...common} />
          </>
        );
      case 'bell':
        return (
          <>
            <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" {...common} />
            <Path d="M10 20.5a2 2 0 0 0 4 0" {...common} />
          </>
        );
      case 'lantern':
        return (
          <>
            <Path d="M12 2.5v2M9 4.5h6M8 7h8l1 9H7z" {...common} />
            <Path d="M7 16l1.5 4h7l1.5-4M12 10v3" {...common} />
          </>
        );
      case 'globe':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" {...common} />
          </>
        );
      case 'trash':
        return (
          <>
            <Path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14" {...common} />
            <Path d="M10 10.5v6M14 10.5v6" {...common} />
          </>
        );
      case 'pencil':
        return <Path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19zM14 7l3.5 3.5" {...common} />;
      default:
        return <Circle cx={12} cy={12} r={4} {...filled} />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {body}
    </Svg>
  );
}
