<template>
  <div>
    <svg
      baseProfile="full"
      class="svg-canvas"
      xmlns="http://www.w3.org/2000/svg"
      id="svg-canvas"
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
      nodes: [
        { x: 100, y: 185, name: "node-1", id: "1" },
        { x: 200, y: 45, name: "node-2", id: "2" }
      ],
      relations: []
    };
  },
  created() {
    window.addEventListener("keyup", this.keyboardShortcutsListener);
  },
  unmounted() {
    window.removeEventListener("keyup", this.keyboardShortcutsListener);
  },
  mounted() {
    this.relations.push({
      id: this.generateRelationID(this.nodes[0].id, this.nodes[1].id),
      start: this.nodes[0],
      end: this.nodes[1]
    });
  },
  methods: {
    slope,
    keyboardShortcutsListener(e) {
      if (e.key === "Escape") this.cancelFieldActions(e);
    },
    addNode(e) {
      if (this.allow_add)
        this.nodes.push({
          x: e.offsetX,
          y: e.offsetY,
          name: "node-" + (this.nodes.length + 1),
          id: (this.nodes.length + 1).toString()
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
        let start = this.getNodeByID(this.start_drag_id);
        let end = this.getNodeByID(this.stop_drag_id);
        let id = this.generateRelationID(this.start_drag_id, this.stop_drag_id);
        let rln = this.getRelationByID(id);
        if (!rln) {
          rln = { id, start, end };
          this.relations.push(rln);
        }
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
        const findAndDeleteByID = (arr, id) => {
          let index = arr.findIndex(n => n.id === id);
          arr.splice(index, 1);
        };
        let [id, arrName] = this.delete_element_temp;
        console.log(`deleting ${id} from ${arrName}`);
        // delete node and relations
        if (arrName === "nodes") {
          this.getNodeRelationIDs(id).forEach(x =>
            findAndDeleteByID(this.relations, x)
          );
          findAndDeleteByID(this.nodes, id);
        }
        // delete relation only
        if (arrName === "relations") {
          findAndDeleteByID(this.relations, id);
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
      return this.nodes.find(x => x.id === id);
    },
    getRelationByID(id) {
      return this.relations.find(r => r.id === id);
    },
    getNodeRelations(node_id) {
      return this.relations.filter(r => {
        let [a, b] = r.id.split("-");
        return a === node_id || b === node_id;
      });
    },
    getRelationNodes(rln_id) {
      return this.nodes.filter(n => {
        let [a, b] = rln_id.split("-");
        return a === n.id || b === n.id;
      });
    },
    getNodeRelationIDs(node_id) {
      return this.relations
        .filter(r => {
          let [a, b] = r.id.split("-");
          return a === node_id || b === node_id;
        })
        .map(r => r.id);
    },
    getRelationNodeIDs(rln_id) {
      return this.nodes
        .filter(n => {
          let [a, b] = rln_id.split("-");
          return a === n.id || b === n.id;
        })
        .map(n => n.id);
    },
    getElementNodeID(el) {
      return el.getAttribute("data-node-id");
    },
    getElementRelationID(el) {
      return el.getAttribute("data-relation-id");
    },
    generateRelationID(nodeID_a, nodeID_b) {
      if (!nodeID_a || !nodeID_b) return;
      return [nodeID_a, nodeID_b].sort().join("-");
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
