export type DirectionType = 'up' | 'down';

export type WaveType = 'wavy' | 'rectangular' | 'triangular';

export interface PluginAddSVGEvent {
  type: 'add-svg';
  content: {
    data: string;
    name: string;
  };
}

export type PluginEvent = PluginAddSVGEvent;
