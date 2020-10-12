<template>
  <div>
    <div class="controls-bar">
      <button @click="allow_add = !allow_add">
        {{ allow_add ? "Disable" : "Enable" }} Add
      </button>
    </div>
    <playground :allow_add="allow_add" />
  </div>
</template>

<script>
import Playground from "./components/Playground.vue";

export default {
  name: "App",
  components: {
    Playground
  },
  data() {
    return {
      allow_add: false
    };
  }
};
</script>

<style lang="scss">
.controls-bar {
  width: 100%;
  height: 8vh;
}
</style>
