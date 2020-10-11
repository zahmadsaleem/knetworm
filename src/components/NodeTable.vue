<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Node</th>
          <th>Parents</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="node in nodes"
          :key="node.id"
          @click="() => rowClicked(node.id)"
        >
          <td
            class="node-name-cell"
            contenteditable="true"
            @input="e => changeName(e, node)"
          >
            {{ node.name }}
          </td>
          <td class="node-child-cell">{{ parents(node.id) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { Field } from "@/models/tree";

export default {
  name: "NodeTable",
  props: {
    field: { type: Field, required: true }
  },
  computed: {
    nodes() {
      return Object.values(this.field.nodes);
    }
  },
  methods: {
    parents(node_id) {
      let p = this.field.getParents(node_id);
      return p.length > 0 ? p.map(x => x.name).join(", ") : "--";
    },
    changeName(e, node) {
      node.name = e.target.innerText;
    },
    rowClicked(id) {
      this.$emit("row-clicked", id);
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  margin: 0 auto;
  padding: 0.25em;
}

th {
  font-size: 110%;
  text-align: left;
}
td {
  box-sizing: border-box;
  padding: 0.15em 0.5em;
  background: lightsteelblue;
}

.node-name-cell {
  width: 25%;
}
.node-child-cell {
  width: 75%;
}
</style>
