<template>
  <g :transform="`translate(${node.x} ${node.y})`">
    <circle
      r="15"
      data-plg-type="node"
      :data-node-id="node.id"
      class="node-drag"
      @mousedown.self.stop="moveNode"
      @mouseup.self.stop="stopMove"
      @contextmenu.prevent.stop="showClose"
    ></circle>
    <circle
      :data-node-id="node.id"
      r="5"
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
  props: { node: { type: Object } },
  methods: {
    moveNode(e) {
      this.$emit("node-move", e);
    },
    stopMove(e) {
      this.$emit("node-move-stop", e);
    },
    showClose(e) {
      this.$emit("show-close", e);
    },
    startDrag(e) {
      this.$emit("relation-start", e);
    },
    stopDrag(e) {
      this.$emit("relation-stop", e);
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
</style>
