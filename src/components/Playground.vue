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
      @click.self="addNode"
      @mouseup="cancelFieldActions"
      @mousemove="doMouseMoveActions"
    >
      <!--      RELATIONSHIPS   -->
      <g v-for="(rln, i) in relations" :key="'rln-' + i">
        <line
          class="node-relation"
          :x1="rln.start.x"
          :x2="rln.end.x"
          :y1="rln.start.y"
          :y2="rln.end.y"
          @contextmenu.prevent.stop="showClose"
        ></line>
      </g>
      <!--      DANGLING LINE  -->
      <line
        v-if="is_dragging"
        class="node-relation"
        :x1="rln_dangling.start.x"
        :x2="rln_dangling.end.x"
        :y1="rln_dangling.start.y"
        :y2="rln_dangling.end.y"
      ></line>
      <!--      NODES   -->
      <g
        v-for="node in nodes"
        :key="node.id"
        :transform="`translate(${node.x} ${node.y})`"
      >
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
      <!-- CLOSE -->
      <delete-relation
        v-if="show_delete_rln"
        :pos="line_delete_pos"
        @delete-item="lineClose"
        style="z-index: 1000"
      />
    </svg>
  </div>
</template>

<script>
import DeleteRelation from "@/components/DeleteRelation";

export default {
  name: "Playground",
  components: { DeleteRelation },
  data() {
    return {
      allow_add: false,
      is_moving_node: false,
      moving_node: null,
      move_diff_x: 0,
      move_diff_y: 0,
      is_dragging: false,
      start_drag_id: null,
      stop_drag_id: null,
      rln_dangling: null,
      show_delete_rln: false,
      line_delete_pos: {},
      nodes: [
        { x: 10, y: 85, name: "node-1", id: 1 },
        { x: 20, y: 45, name: "node-2", id: 2 }
      ],
      relations: []
    };
  },
  methods: {
    addNode(e) {
      if (this.allow_add)
        this.nodes.push({
          x: e.offsetX,
          y: e.offsetY,
          name: "node-" + (this.nodes.length + 1),
          id: this.nodes.length + 1
        });
    },
    startDrag(e) {
      // console.log("drag-started");
      this.rln_dangling = {
        start: { x: e.offsetX, y: e.offsetY },
        end: { x: e.offsetX, y: e.offsetY }
      };
      this.is_dragging = true;
      this.stop_drag_id = null;
      this.start_drag_id = +this.getElementNodeID(e.target);
    },
    stopDrag(e) {
      console.log("drag-stop-fired");
      let id = this.getElementNodeID(e.target);
      if (this.is_dragging && this.start_drag_id && id) {
        // console.log("drag-stopped");
        this.stop_drag_id = id;
        this.drawRelation();
      }
      this.is_dragging = false;
      this.start_drag_id = null;
      this.rln_dangling = null;
    },
    drawRelation() {
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
    },
    showClose(e) {
      this.line_delete_pos = { x: e.offsetX, y: e.offsetY };
      this.show_delete_rln = true;
    },
    lineClose() {
      this.show_delete_rln = false;
    },
    getElementNodeID(el) {
      return el.getAttribute("data-node-id");
    },
    moveNode(e) {
      let id = this.getElementNodeID(e.target);
      if (!this.is_moving_node && id) {
        this.moving_node = this.getNodeByID(id);
        this.is_moving_node = true;
        // console.log("moving-started");
        this.move_diff_x = e.offsetX - this.moving_node.x;
        this.move_diff_y = e.offsetY - this.moving_node.y;
      }
    },
    stopMove() {
      // console.log("moving-stopped");
      this.is_moving_node = false;
      this.moving_node = null;
      this.move_diff_x = 0;
      this.move_diff_y = 0;
    },
    keepMoving(e) {
      if (this.is_moving_node) {
        // console.log("moving");
        this.moving_node.x = e.offsetX - this.move_diff_x;
        this.moving_node.y = e.offsetY - this.move_diff_y;
      }
    },
    cancelFieldActions(e) {
      this.stopDrag(e);
      this.stopMove();
    },
    doMouseMoveActions(e) {
      this.setDangling(e);
      this.keepMoving(e);
    }
  }
};
</script>

<style scoped lang="scss">
$primary: #2b2d42;
$primaryLighter: #8d99ae;
$light: #edf2f4;
$secondaryLighter: #ef233c;
$secondary: #d90429;

.svg-canvas {
  width: 80vw;
  height: 80vh;
  display: block;
  border: black solid thin;
  margin: auto;
}

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

.node-relation {
  stroke: $secondaryLighter;
  stroke-width: 2px;

  &:hover {
    stroke-width: 4px;
  }
}
</style>
