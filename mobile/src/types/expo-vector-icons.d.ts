declare module '@expo/vector-icons' {
  import type { ComponentType } from 'react';

  type IconProps = {
    name: string;
    size?: number;
    color?: string;
  };

  export const Ionicons: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };
}
