<template>
  <g :transform="`translate(${pos.x} ${pos.y - 20}) scale(2)`">
    <circle r="5" class="close-circle"></circle>
    <line x1="-2" x2="2" y1="-2" y2="2" class="close-line"></line>
    <line x1="-2" x2="2" y1="2" y2="-2" class="close-line"></line>
  </g>
</template>

<script>
export default {
  name: "FieldElementDelete",
  props: {
    pos: { type: Object, required: true }
  },
  methods: {
    deleteItem(e) {
      console.log("delete item invoked");
      this.$emit("delete-item", e);
    }
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
