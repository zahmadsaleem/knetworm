<template>
  <g>
    <line
      class="node-relation"
      :data-relation-id="relation.id"
      :x1="relation.start.x"
      :x2="relation.end.x"
      :y1="relation.start.y"
      :y2="relation.end.y"
      @contextmenu.prevent.stop="showClose"
    ></line>
    <g
      :transform="
        `
            translate(${relation.end.x} ${relation.end.y})
            scale(20)
            rotate(${slope(
              relation.start.y - relation.end.y,
              relation.start.x - relation.end.x
            )})
            `
      "
    >
      <line x1="-1" x2="0" y1="1" y2="0" class="arrow-line"></line>
      <line x1="-1" x2="0" y1="-1" y2="0" class="arrow-line"></line>
    </g>
  </g>
</template>

<script>
export default {
  name: "RelationLine",
  props: {
    relation: {
      type: Object,
      default: () => ({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })
    }
  },
  methods: {
    slope(y, x) {
      let angle = Math.atan2(y, x) * 57.2958;
      return 180 + angle;
    },
    showClose(e) {
      this.$emit("show-close", e);
    }
  }
};
</script>

<style scoped lang="scss">
@import "src/assets/scss/main";

.node-relation {
  stroke: $secondaryLighter;
  stroke-width: 2px;

  &:hover {
    stroke-width: 4px;
  }
}

.arrow-line {
  stroke: $secondaryLighter;
  stroke-width: 0.2px;
}
</style>
