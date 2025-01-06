// @ts-nocheck

export const complexitySlider = () => ({
  value: 10,

  init() {
    this.value = Number.parseInt(this.$el.value);
  },

  updateValue(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = Number.parseInt(input.value);
    this.$store.wave.updateComplexity(this.value);
  },
});
