// @ts-nocheck

export const directionSelector = () => ({
  direction: '',
  isActive: false,

  init() {
    this.direction = this.$el.dataset.direction;
    this.isActive = this.$el.classList.contains('active');
  },

  updateDirection() {
    const buttons = document.querySelectorAll('.direction-btn');
    for (const btn of buttons) btn.classList.remove('active');
    this.$el.classList.add('active');
    this.$store.wave.updateDirection(this.direction);
  },
});
