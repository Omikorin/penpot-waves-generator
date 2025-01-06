import type { Theme } from '@penpot/plugin-types';

export type DirectionType = 'up' | 'down';

export type CurveType = 'wave' | 'step' | 'peak';

export type Gradient = [string, string];

export interface Wave {
  id: string;
  data: number[];
  curve: CurveType;
  color: string | Gradient;
  direction: DirectionType;
  opacity: number;
  complexity?: number;
  translateY?: number;
}

// Penpot integration types
export interface CreatePatternEvent {
  type: 'create-pattern';
  content: {
    data: string;
    name: string;
  };
}

export type PluginUIEvent = CreatePatternEvent;

export interface ThemeChangeEvent {
  type: 'themechange';
  content: Theme;
}

export type PluginEvent = ThemeChangeEvent;
