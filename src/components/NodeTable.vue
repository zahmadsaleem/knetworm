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
        <tr v-for="node in nodes" :key="node.id">
          <td>{{ node.name }}</td>
          <td>{{ parents(node.id) }}</td>
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
      console.log(p);
      return p.length > 0 ? p.map(x => x.name).join(", ") : "--";
    }
  }
};
</script>

<style scoped></style>
