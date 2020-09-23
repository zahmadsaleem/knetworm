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
      <relation-line
        v-for="(rln, i) in relations"
        :key="'rln-' + i"
        :relation="rln"
        @show-close="showClose"
      />
      <!--      DANGLING LINE  -->
      <relation-line v-if="is_dragging" :relation="rln_dangling" />
      <!--      NODES   -->
      <node-element
        v-for="node in nodes"
        :node="node"
        :key="node.id"
        @node-move="moveNode"
        @node-move-stop="stopMove"
        @show-close="showClose"
        @relation-start="startDrag"
        @relation-stop="stopDrag"
      />
      <!-- CLOSE -->
      <field-element-delete
        v-if="show_delete"
        :pos="line_delete_pos"
        @delete-item="deleteElement"
      />
    </svg>
  </div>
</template>

<script>
import FieldElementDelete from "@/components/FieldElementDelete";
import RelationLine from "@/components/RelationLine";
import NodeElement from "@/components/NodeElement";

export default {
  name: "Playground",
  components: { NodeElement, RelationLine, FieldElementDelete },
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
      show_delete: false,
      line_delete_pos: {},
      delete_element_temp: null,
      nodes: [
        { x: 100, y: 185, name: "node-1", id: 1 },
        { x: 200, y: 45, name: "node-2", id: 2 }
      ],
      relations: []
    };
  },
  mounted() {
    this.relations.push({ start: this.nodes[0], end: this.nodes[1] });
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
    slope(y, x) {
      let angle = Math.atan2(y, x) * 57.2958;
      return 180 + angle;
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
      // console.log("drag-stop-fired");
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
      this.show_delete = true;
      let node_id = this.getElementNodeID(e.target);
      let rln_id = this.getElementRelationID(e.target);
      this.delete_element_temp = node_id
        ? [node_id, this.nodes]
        : rln_id
        ? [rln_id, this.relations]
        : null;
    },
    deleteElement() {
      let [id, arr] = this.delete_element_temp;
      let index = arr.findIndex(n => n === id);
      arr.splice(index, 1);
      this.clearDelete();
    },
    clearDelete() {
      this.show_delete = false;
      this.delete_element_temp = null;
    },
    getElementNodeID(el) {
      return el.getAttribute("data-node-id");
    },
    getElementRelationID(el) {
      return el.getAttribute("data-relation-id");
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
      this.clearDelete();
    },
    doMouseMoveActions(e) {
      this.setDangling(e);
      this.keepMoving(e);
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
</style>
