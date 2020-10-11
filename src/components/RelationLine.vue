<template>
  <g>
    <line
      class="node-relation"
      :data-relation-id="relation_id"
      :x1="start.x"
      :x2="end.x"
      :y1="start.y"
      :y2="end.y"
      @contextmenu.prevent.stop="showClose"
    ></line>
    <g
      :transform="
        `
            translate(${end.x} ${end.y})
            scale(20)
            rotate(${slope(start.y - end.y, start.x - end.x)})
            `
      "
    >
      <line x1="-1" x2="0" y1="1" y2="0" class="arrow-line"></line>
      <line x1="-1" x2="0" y1="-1" y2="0" class="arrow-line"></line>
    </g>
  </g>
</template>

<script>
import { Point, Node } from "@/models/tree";

export default {
  name: "RelationLine",
  props: {
    relation_id: { type: String },
    start: { type: [Point, Node], default: () => new Point() },
    end: { type: [Point, Node], default: () => new Point() }
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
