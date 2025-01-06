// @ts-nocheck

import { createPattern, downloadSVG } from '../common/actions';

export const waveActions = () => ({
  randomize() {
    this.$store.wave.randomize();
  },
  
  downloadSVG,
  createPattern,
});
