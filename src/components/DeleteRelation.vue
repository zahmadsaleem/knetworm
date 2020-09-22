<template>
  <g
    :transform="`translate(${pos.x} ${pos.y - 20}) scale(2)`"
    @click="() => $emit('delete-item')"
  >
    <circle r="5" class="close-circle"></circle>
    <line x1="-2" x2="2" y1="-2" y2="2" class="close-line"></line>
    <line x1="-2" x2="2" y1="2" y2="-2" class="close-line"></line>
  </g>
</template>

<script>
export default {
  name: "DeleteRelation",
  props: {
    pos: { type: Object, required: true }
  }
};
</script>

<style scoped lang="scss">
.close-circle {
  fill: white;
  stroke: red;
  &:hover {
    fill: beige;
  }
}

.close-line {
  stroke: red;
  stroke-width: 1px;
}
</style>
