<template>
  <div>
    <h1>Edit Character</h1>
    <p>Character ID: {{ id }}</p>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
