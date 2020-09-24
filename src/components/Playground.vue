<template>
  <div>
    <svg
      class="svg-canvas"
      xmlns="http://www.w3.org/2000/svg"
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
        @click.capture="deleteElement"
      />
    </svg>
  </div>
</template>

<script>
import FieldElementDelete from "@/components/FieldElementDelete";
import RelationLine from "@/components/RelationLine";
import NodeElement from "@/components/NodeElement";
import { slope } from "@/utils/geometry_utils";
import field from "@/models/tree";

export default {
  name: "Playground",
  components: { NodeElement, RelationLine, FieldElementDelete },
  props: {
    allow_add: { type: Boolean, default: () => false }
  },
  data() {
    return {
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
      field: field
    };
  },
  created() {
    window.addEventListener("keyup", this.keyboardShortcutsListener);
  },
  unmounted() {
    window.removeEventListener("keyup", this.keyboardShortcutsListener);
  },
  mounted() {
    this.field.nodes.push(
      { x: 100, y: 185, name: "node-1", id: "1" },
      { x: 200, y: 45, name: "node-2", id: "2" }
    );
    this.field.addRelation(this.nodes[0], this.nodes[1]);
  },
  computed: {
    nodes() {
      return this.field.nodes;
    },
    relations() {
      return this.field.relations;
    }
  },
  methods: {
    slope,
    keyboardShortcutsListener(e) {
      if (e.key === "Escape") this.cancelFieldActions(e);
    },
    addNode(e) {
      if (this.allow_add) {
        let node = this.field.addNode("node-" + (this.field.nodes.length + 1));
        if (node) {
          node.x = e.offsetX;
          node.y = e.offsetY;
        }
      }
    },
    startDrag(e) {
      // console.log("drag-started");
      this.rln_dangling = {
        start: { x: e.offsetX, y: e.offsetY },
        end: { x: e.offsetX, y: e.offsetY }
      };
      this.is_dragging = true;
      this.stop_drag_id = null;
      this.start_drag_id = this.getElementNodeID(e.target);
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
        let child = this.getNodeByID(this.start_drag_id);
        let parent = this.getNodeByID(this.stop_drag_id);
        this.field.addRelation(parent, child);
      }
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
    showClose(e) {
      this.line_delete_pos = { x: e.offsetX, y: e.offsetY };
      this.show_delete = true;
      let node_id = this.getElementNodeID(e.target);
      let rln_id = this.getElementRelationID(e.target);
      this.delete_element_temp = node_id
        ? [node_id, "nodes"]
        : rln_id
        ? [rln_id, "relations"]
        : null;
    },
    deleteElement() {
      console.log("delete fired");
      if (this.delete_element_temp) {
        let [id, arrName] = this.delete_element_temp;
        console.log(`deleting ${id} from ${arrName}`);
        if (arrName === "nodes") {
          this.field.deleteNodeByID(id);
        }
        if (arrName === "relations") {
          this.field.deleteRelationByID(id);
        }
        this.clearDelete();
      }
    },
    clearDelete() {
      this.show_delete = false;
      this.delete_element_temp = null;
      this.line_delete_pos = {};
    },
    cancelFieldActions(e) {
      this.stopDrag(e);
      this.stopMove();
      if (e.eventPhase === Event.AT_TARGET) {
        this.clearDelete();
      }
    },
    doMouseMoveActions(e) {
      this.setDangling(e);
      this.keepMoving(e);
    },
    getNodeByID(id) {
      return this.field.getNodeByID(id);
    },
    getRelationByID(id) {
      return this.field.getRelationByID(id);
    },
    getElementNodeID(el) {
      return el.getAttribute("data-node-id");
    },
    getElementRelationID(el) {
      return el.getAttribute("data-relation-id");
    }
  }
};
</script>

<style scoped lang="scss">
.svg-canvas {
  width: 95vw;
  height: 90vh;
  display: block;
  margin-left: auto;
  margin-right: auto;
  border: black solid thin;
  box-sizing: border-box;
  border-radius: 1em;
}
</style>
