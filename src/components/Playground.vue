<template>
  <div class="hello">
    <button @click="allow_add = !allow_add">
      {{ allow_add ? "Disable" : "Enable" }} Add
    </button>

    <svg
      baseProfile="full"
      class="svg-canvas"
      xmlns="http://www.w3.org/2000/svg"
      ref="svg_canvas"
      @click.self="add_node"
      @mouseup="stop_drag"
      @mousemove="setDangling"
    >
      <g v-for="(rln, i) in relations" :key="'rln-' + i">
        <line
          class="node-relation"
          :x1="rln.start.x"
          :x2="rln.end.x"
          :y1="rln.start.y"
          :y2="rln.end.y"
        ></line>
      </g>
      <line
        v-if="is_dragging"
        class="node-relation"
        :x1="rln_dangling.start.x"
        :x2="rln_dangling.end.x"
        :y1="rln_dangling.start.y"
        :y2="rln_dangling.end.y"
      ></line>
      <g
        v-for="node in nodes"
        :key="node.id"
        :transform="`translate(${node.x} ${node.y})`"
      >
        <circle r="10" class="node-drag"></circle>
        <circle
          :data-node-id="node.id"
          r="5"
          class="node"
          @mousedown.self.stop="start_drag"
          @mouseup.self.stop="stop_drag"
        ></circle>
        <text class="node-name" x="15" y="5">
          {{ node.name }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: "Playground",
  data() {
    return {
      allow_add: false,
      is_dragging: false,
      start_drag_id: null,
      stop_drag_id: null,
      rln_dangling: null,
      nodes: [
        { x: 10, y: 85, name: "node-1", id: 1 },
        { x: 20, y: 45, name: "node-2", id: 2 }
      ],
      relations: []
    };
  },
  methods: {
    add_node(e) {
      if (this.allow_add)
        this.nodes.push({
          x: e.offsetX,
          y: e.offsetY,
          name: "node-" + this.nodes.length,
          id: this.nodes.length + 1
        });
    },
    start_drag(e) {
      console.log("drag-started");
      this.rln_dangling = {
        start: { x: e.offsetX, y: e.offsetY },
        end: { x: e.offsetX, y: e.offsetY }
      };
      this.is_dragging = true;
      this.stop_drag_id = null;
      this.start_drag_id = +e.target.getAttribute("data-node-id");
    },
    stop_drag(e) {
      console.log("drag-stop-fired");
      let id = e.target.getAttribute("data-node-id");
      if (this.is_dragging && this.start_drag_id && id) {
        console.log("drag-stopped");
        this.stop_drag_id = id;
        this.draw_relation();
      }
      this.is_dragging = false;
      this.start_drag_id = null;
      this.rln_dangling = null;
    },
    draw_relation() {
      if (
        this.start_drag_id &&
        this.stop_drag_id &&
        this.start_drag_id !== this.stop_drag_id
      ) {
        let start = this.getNodeByID(this.start_drag_id);
        let end = this.getNodeByID(this.stop_drag_id);
        let rln = {
          start,
          end
        };
        this.relations.push(rln);
      }
    },
    getNodeByID(id) {
      return this.nodes.find(x => x.id === +id);
    },
    setDangling(e) {
      if (this.is_dragging) {
        let start = this.getNodeByID(this.start_drag_id);
        this.rln_dangling = {
          start: { x: start.x, y: start.y },
          end: { x: e.offsetX, y: e.offsetY }
        };
      }
    }
  }
};
</script>

<style scoped lang="scss">
.svg-canvas {
  width: 80vw;
  height: 80vh;
  display: block;
  border: black solid thin;
  margin: auto;
}

.node {
  fill: dimgrey;
}

.node-drag {
  fill: aqua;
}

.node-name {
  fill: gold;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
}

.node-name::selection {
  background: none;
}

.node-relation {
  stroke: gold;
  stroke-width: 2px;
}
</style>
