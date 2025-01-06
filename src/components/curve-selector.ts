// @ts-nocheck

export const curveSelector = () => ({
  type: '',
  isActive: false,

  init() {
    this.type = this.$el.dataset.type;
    this.isActive = this.$el.classList.contains('active');
  },

  updateCurve() {
    const buttons = document.querySelectorAll('.wave-type');
    for (const btn of buttons) btn.classList.remove('active');
    this.$el.classList.add('active');
    this.$store.wave.updateCurve(this.type);
  },
});
