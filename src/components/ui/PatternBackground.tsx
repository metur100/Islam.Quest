import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

interface PatternBackgroundProps {
  color?: string;
  opacity?: number;
}

/** Subtle eight-point-star geometric pattern used behind headers and screens. */
export function PatternBackground({ color = '#FFFFFF', opacity = 0.07 }: PatternBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="girih" width={56} height={56} patternUnits="userSpaceOnUse">
            <Path
              d="M28 6 34 22 50 28 34 34 28 50 22 34 6 28 22 22Z M28 14 31.5 24.5 42 28 31.5 31.5 28 42 24.5 31.5 14 28 24.5 24.5Z"
              fill="none"
              stroke={color}
              strokeWidth={1.2}
              opacity={opacity * 10}
            />
            <Path d="M0 0 6 6 M56 0 50 6 M0 56 6 50 M56 56 50 50" stroke={color} strokeWidth={1.2} opacity={opacity * 10} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#girih)" opacity={opacity} />
      </Svg>
    </View>
  );
}
