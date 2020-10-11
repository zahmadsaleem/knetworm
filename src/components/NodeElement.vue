<template>
  <g :transform="`translate(${node.x} ${node.y})`">
    <circle
      :r="outerRadius"
      data-plg-type="node"
      :data-node-id="node.id"
      class="node-drag"
      :class="selected ? 'selected' : ''"
      @mousedown.self.stop="moveNode"
      @mouseup.self.stop="onMouseUpOuter"
      @contextmenu.prevent.stop="showClose"
      @click.self.stop="onClickOuter"
    ></circle>
    <circle
      :data-node-id="node.id"
      :r="innerRadius"
      class="node"
      @mousedown.self.stop="startDrag"
      @mouseup.self.stop="stopDrag"
    ></circle>
    <text class="node-name" x="15" y="5">
      {{ node.name }}
    </text>
  </g>
</template>

<script>
export default {
  name: "NodeElement",
  props: {
    node: { type: Object },
    selected: { type: Boolean, default: () => false }
  },
  data() {
    return {
      outerRadius: "15px",
      innerRadius: "8px"
    };
  },
  methods: {
    moveNode(e) {
      this.$emit("node-move", e);
    },
    onMouseUpOuter(e) {
      this.$emit("node-move-stop", e);
      this.$emit("relation-stop", e);
    },
    showClose(e) {
      this.$emit("show-close", e);
    },
    startDrag(e) {
      this.$emit("relation-start", e);
    },
    stopDrag(e) {
      this.$emit("relation-stop", e);
    },
    onClickOuter() {
      this.$emit("select-node", this.node.id);
    }
  }
};
</script>

<style scoped lang="scss">
@import "src/assets/scss/main";

.node {
  fill: $primary;
}

.node-drag {
  fill: $primaryLighter;
}

.node-name {
  fill: $primary;
  font-family: monospace;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
}

.node-name::selection {
  background: none;
}

.selected {
  stroke: #d90429;
  stroke-width: 2px;
}
</style>
