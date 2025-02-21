<template>
  <v-container>
    <h1>Agregar Personaje</h1>
    <v-form @submit.prevent="submit">
      <v-text-field v-model="name" label="Nombre" required></v-text-field>
      <v-text-field v-model="description" label="Descripción"></v-text-field>
      <v-btn type="submit" color="primary">Guardar</v-btn>
      <v-btn variant="text" @click="cancel">Cancelar</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCharacters } from "@/composables/useCharacters";

const name = ref("");
const description = ref("");
const { createCharacter } = useCharacters();
const router = useRouter();

function submit() {
  if (name.value.trim()) {
    createCharacter({ name: name.value, description: description.value });
    router.push("/characters");
  }
}

function cancel() {
  router.back();
}
</script>
